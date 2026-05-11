from datetime import UTC, datetime

from beanie import Document
from pydantic import Field


class User(Document):
    name: str | None = None
    kaist_email: str = Field(min_length=3)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "users"
        indexes = ["kaist_email"]
