from datetime import datetime

from pydantic import BaseModel


class ExampleCreate(BaseModel):
    name: str


class ExampleDTO(BaseModel):
    id: str
    name: str
    created_at: datetime
