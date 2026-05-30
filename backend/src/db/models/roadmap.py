from datetime import UTC, datetime
from typing import Annotated, Literal

from beanie import Document
from pymongo import ASCENDING, IndexModel
from pydantic import BaseModel, Field

from db.models.course import CourseCategoryName

RoadmapCourseGrade = Literal[
    "PLANNED",
    "A+",
    "A0",
    "A-",
    "B+",
    "B0",
    "B-",
    "C+",
    "C0",
    "C-",
    "D+",
    "D0",
    "D-",
    "F",
    "S",
    "U",
]


class CatalogRoadmapCourse(BaseModel):
    type: Literal["catalog"] = "catalog"
    semester_number: int = Field(ge=1)
    course_code: str = Field(min_length=1)
    grade: RoadmapCourseGrade = "PLANNED"


class CustomRoadmapCourse(BaseModel):
    type: Literal["custom"] = "custom"
    semester_number: int = Field(ge=1)
    course_code: str = Field(min_length=1)
    title: str = Field(min_length=1)
    credit: int = Field(ge=0)
    category: CourseCategoryName
    grade: RoadmapCourseGrade = "PLANNED"


RoadmapCourse = Annotated[
    CatalogRoadmapCourse | CustomRoadmapCourse,
    Field(discriminator="type"),
]


class Roadmap(Document):
    user_id: str
    current_semester_number: int = Field(default=1, ge=1)
    courses: list[RoadmapCourse] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "roadmaps"
        indexes = [IndexModel([("user_id", ASCENDING)], unique=True)]
