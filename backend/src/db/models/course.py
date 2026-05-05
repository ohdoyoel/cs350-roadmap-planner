from datetime import UTC, datetime

from beanie import Document
from pydantic import BaseModel, Field


class CourseCredit(BaseModel):
    lecture: int
    lab: int
    credit: int
    au: int = 0
    raw: str


class Course(Document):
    code: str = Field(min_length=2)
    title: str = Field(min_length=1)
    title_en: str | None = None
    requirement: str
    terms: list[str] = Field(default_factory=list)
    credits: CourseCredit
    categories: list[str] = Field(default_factory=list)
    prerequisites: list[str] = Field(default_factory=list)
    is_key_course: bool = False
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "courses"
        indexes = ["code", "requirement", "categories"]
