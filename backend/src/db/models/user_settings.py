from datetime import UTC, datetime
from typing import Literal

from beanie import Document
from pydantic import Field

Theme = Literal["system", "light", "dark"]
Language = Literal["ko", "en"]
AcademicOption = Literal["major", "minor", "double_major"]


class UserSettings(Document):
    user_id: str
    theme: Theme = "system"
    language: Language = "ko"
    academic_option: AcademicOption = "major"
    graduation_year: int | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "settings"
        indexes = ["user_id"]
