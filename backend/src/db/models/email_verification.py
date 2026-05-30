from datetime import UTC, datetime

from beanie import Document
from pydantic import Field


class EmailVerification(Document):
    user_id: str
    email: str
    token_hash: str
    expires_at: datetime
    used_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "email_verifications"
        indexes = ["user_id", "token_hash", "email"]
