from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer

from db.models.course import CourseCategoryName
from db.models.roadmap import RoadmapCourseGrade
from db.models.user_settings import AcademicOption
from fastapi_app.schemas.roadmaps import SemesterNumber, semester_number_to_label

RequirementKey = Literal[
    "basic",
    "major_required",
    "major_elective",
    "major_total",
    "capstone",
    "graduation_research",
]

CourseStatus = Literal[
    "completed",
    "in_progress",
    "planned",
    "missing_grade",
]


class CreditGPACreditsDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    completed: int
    in_progress: int = Field(serialization_alias="inProgress")
    remaining: int


class CreditGPARequirementDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    key: RequirementKey
    label: str
    required_credits: int = Field(serialization_alias="requiredCredits")
    completed_credits: int = Field(serialization_alias="completedCredits")
    in_progress_credits: int = Field(serialization_alias="inProgressCredits")
    remaining_credits: int = Field(serialization_alias="remainingCredits")


class CreditGPACourseDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: Literal["catalog", "custom"]
    course_code: str = Field(serialization_alias="courseCode")
    title: str
    title_en: str | None = Field(serialization_alias="titleEn")
    semester_number: SemesterNumber = Field(serialization_alias="semester")
    category: CourseCategoryName
    credit: int
    grade: RoadmapCourseGrade
    status: CourseStatus

    @field_serializer("semester_number")
    def serialize_semester(self, value: int) -> str:
        return semester_number_to_label(value)


class CreditGPACourseGroupDTO(BaseModel):
    key: RequirementKey
    label: str
    items: list[CreditGPACourseDTO]


class CreditGPADTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    current_semester_number: SemesterNumber = Field(
        serialization_alias="currentSemester",
    )
    academic_option: AcademicOption = Field(serialization_alias="academicOption")
    credits: CreditGPACreditsDTO
    gpa: float | None
    requirements: list[CreditGPARequirementDTO]
    courses: list[CreditGPACourseGroupDTO]

    @field_serializer("current_semester_number")
    def serialize_current_semester(self, value: int) -> str:
        return semester_number_to_label(value)
