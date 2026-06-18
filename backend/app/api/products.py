import uuid
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["products"])

DbDep = Annotated[Session, Depends(get_db)]


def _parse_uuid(value: str) -> UUID:
    try:
        return UUID(value)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid UUID format")


@router.get("", response_model=list[ProductRead])
def list_products(db: DbDep):
    return db.query(Product).order_by(Product.created_at.desc()).all()


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(body: ProductCreate, db: DbDep):
    if db.query(Product).filter(Product.sku_code == body.sku_code).first():
        raise HTTPException(status_code=400, detail="SKU code already exists")
    if db.query(Product).filter(Product.product_name == body.product_name).first():
        raise HTTPException(status_code=400, detail="A product with this name already exists")
    product = Product(id=uuid.uuid4(), **body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: str, db: DbDep):
    product = db.query(Product).filter(Product.id == _parse_uuid(product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(product_id: str, body: ProductUpdate, db: DbDep):
    product = db.query(Product).filter(Product.id == _parse_uuid(product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    updates = body.model_dump(exclude_none=True)
    if "product_name" in updates and updates["product_name"] != product.product_name:
        if db.query(Product).filter(Product.product_name == updates["product_name"]).first():
            raise HTTPException(status_code=400, detail="A product with this name already exists")
    for field, value in updates.items():
        setattr(product, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="SKU code already exists")
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: DbDep):
    product = db.query(Product).filter(Product.id == _parse_uuid(product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    try:
        db.delete(product)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product — it is referenced by existing orders",
        )
