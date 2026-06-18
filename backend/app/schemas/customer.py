from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CustomerCreate(BaseModel):
    name: str
    email: str
    phone_number: str


class CustomerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    phone_number: str
    created_at: datetime
    updated_at: datetime
