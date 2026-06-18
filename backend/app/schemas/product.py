from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    product_name: str
    sku_code: str
    price: Decimal
    quantity: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    sku_code: Optional[str] = None
    price: Optional[Decimal] = None
    quantity: Optional[int] = Field(default=None, ge=0)


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_name: str
    sku_code: str
    price: Decimal
    quantity: int
    created_at: datetime
    updated_at: datetime
