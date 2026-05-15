from datetime import UTC, datetime

from beanie import Document
from pydantic import Field


class AuthSession(Document):
    user_id: str
    token_hash: str
    is_active: bool = True
    expires_at: datetime
    last_used_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    ended_at: datetime | None = None

    class Settings:
        name = "auth_sessions"
        indexes = ["user_id", "token_hash", "is_active", "expires_at"]
