from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class OrderCreate(BaseModel):
    customer_id: UUID
    product_id: UUID
    quantity_ordered: int


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    product_id: UUID
    quantity_ordered: int
    total_amount_paid: Decimal
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
