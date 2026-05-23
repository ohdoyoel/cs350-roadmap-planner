from datetime import datetime
from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    WithJsonSchema,
    field_serializer,
    field_validator,
)

from db.models.course import CourseCategoryName
from db.models.roadmap import RoadmapCourseGrade

SemesterNumber = Annotated[
    int,
    WithJsonSchema(
        {
            "type": "string",
            "pattern": r"^[1-9]\d*-[12]$",
            "example": "2-1",
        },
    ),
]


def semester_number_to_label(semester_number: int) -> str:
    academic_year = (semester_number - 1) // 2 + 1
    academic_term = 1 if semester_number % 2 == 1 else 2
    return f"{academic_year}-{academic_term}"


def semester_label_to_number(value: str | int) -> int:
    if isinstance(value, int):
        if value < 1:
            raise ValueError("semester must be at least 1")
        return value

    parts = value.split("-")
    if len(parts) != 2:
        raise ValueError("semester must use the format '<year>-<term>'")

    try:
        academic_year = int(parts[0])
        academic_term = int(parts[1])
    except ValueError as exc:
        raise ValueError("semester year and term must be integers") from exc

    if academic_year < 1:
        raise ValueError("semester year must be at least 1")
    if academic_term not in {1, 2}:
        raise ValueError("semester term must be 1 or 2")

    return (academic_year - 1) * 2 + academic_term


class CatalogRoadmapCourseDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: Literal["catalog"] = "catalog"
    semester_number: SemesterNumber = Field(
        ge=1,
        validation_alias="semester",
        serialization_alias="semester",
    )
    course_code: str = Field(
        min_length=1,
        validation_alias="courseCode",
        serialization_alias="courseCode",
    )
    grade: RoadmapCourseGrade = "PLANNED"

    @field_validator("semester_number", mode="before")
    @classmethod
    def parse_semester(cls, value: str | int) -> int:
        return semester_label_to_number(value)

    @field_serializer("semester_number")
    def serialize_semester(self, value: int) -> str:
        return semester_number_to_label(value)


class CustomRoadmapCourseDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: Literal["custom"] = "custom"
    semester_number: SemesterNumber = Field(
        ge=1,
        validation_alias="semester",
        serialization_alias="semester",
    )
    course_code: str = Field(
        min_length=1,
        validation_alias="courseCode",
        serialization_alias="courseCode",
    )
    title: str = Field(min_length=1)
    credit: int = Field(ge=0)
    category: CourseCategoryName
    grade: RoadmapCourseGrade = "PLANNED"

    @field_validator("semester_number", mode="before")
    @classmethod
    def parse_semester(cls, value: str | int) -> int:
        return semester_label_to_number(value)

    @field_serializer("semester_number")
    def serialize_semester(self, value: int) -> str:
        return semester_number_to_label(value)


RoadmapCourseDTO = Annotated[
    CatalogRoadmapCourseDTO | CustomRoadmapCourseDTO,
    Field(discriminator="type"),
]


class RoadmapDTO(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "665000000000000000000001",
                "userId": "665000000000000000000002",
                "currentSemester": "1-1",
                "courses": [],
                "createdAt": "2026-05-23T13:19:10.525Z",
                "updatedAt": "2026-05-23T13:19:10.525Z",
            },
        },
    )

    id: str
    user_id: str = Field(serialization_alias="userId")
    current_semester_number: SemesterNumber = Field(
        ge=1,
        serialization_alias="currentSemester",
    )
    courses: list[RoadmapCourseDTO]
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    @field_serializer("current_semester_number")
    def serialize_current_semester(self, value: int) -> str:
        return semester_number_to_label(value)

