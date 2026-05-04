from datetime import UTC, datetime

from beanie import Document
from pydantic import Field


class Example(Document):
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "examples"

