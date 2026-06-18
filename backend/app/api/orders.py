import uuid
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Customer, Order, Product
from app.schemas.order import OrderCreate, OrderRead

router = APIRouter(prefix="/api/orders", tags=["orders"])

DbDep = Annotated[Session, Depends(get_db)]


def _parse_uuid(value: str) -> UUID:
    try:
        return UUID(value)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid UUID format")


def _to_dict(order: Order, customer_name: Optional[str], product_name: Optional[str]) -> dict:
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "product_id": order.product_id,
        "quantity_ordered": order.quantity_ordered,
        "total_amount_paid": order.total_amount_paid,
        "customer_name": customer_name,
        "product_name": product_name,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }


@router.get("", response_model=list[OrderRead])
def list_orders(db: DbDep):
    rows = (
        db.query(Order, Customer.name, Product.product_name)
        .join(Customer, Order.customer_id == Customer.id)
        .join(Product, Order.product_id == Product.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_to_dict(order, cname, pname) for order, cname, pname in rows]


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(body: OrderCreate, db: DbDep):
    customer = db.query(Customer).filter(Customer.id == body.customer_id).first()
    if not customer:
        raise HTTPException(status_code=400, detail="Customer not found")
    product = db.query(Product).filter(Product.id == body.product_id).first()
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")
    if product.quantity < body.quantity_ordered:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock: only {product.quantity} units available",
        )
    product.quantity -= body.quantity_ordered
    total = product.price * body.quantity_ordered
    order = Order(id=uuid.uuid4(), total_amount_paid=total, **body.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return _to_dict(order, customer.name, product.product_name)


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: str, db: DbDep):
    row = (
        db.query(Order, Customer.name, Product.product_name)
        .join(Customer, Order.customer_id == Customer.id)
        .join(Product, Order.product_id == Product.id)
        .filter(Order.id == _parse_uuid(order_id))
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")
    order, cname, pname = row
    return _to_dict(order, cname, pname)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: str, db: DbDep):
    order = db.query(Order).filter(Order.id == _parse_uuid(order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if product:
        product.quantity += order.quantity_ordered
    db.delete(order)
    db.commit()
