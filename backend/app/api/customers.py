import uuid
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Customer
from app.schemas.customer import CustomerCreate, CustomerRead

router = APIRouter(prefix="/api/customers", tags=["customers"])

DbDep = Annotated[Session, Depends(get_db)]


def _parse_uuid(value: str) -> UUID:
    try:
        return UUID(value)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid UUID format")


@router.get("", response_model=list[CustomerRead])
def list_customers(db: DbDep):
    return db.query(Customer).order_by(Customer.created_at.desc()).all()


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(body: CustomerCreate, db: DbDep):
    if db.query(Customer).filter(Customer.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    customer = Customer(id=uuid.uuid4(), **body.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: str, db: DbDep):
    customer = db.query(Customer).filter(Customer.id == _parse_uuid(customer_id)).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: str, db: DbDep):
    customer = db.query(Customer).filter(Customer.id == _parse_uuid(customer_id)).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    try:
        db.delete(customer)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Cannot delete customer — they have existing orders",
        )
