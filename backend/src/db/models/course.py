from datetime import UTC, datetime
from typing import Literal

from beanie import Document
from pydantic import BaseModel, Field

CourseCategoryName = Literal[
    "기초필수",
    "기초선택",
    "전공필수",
    "전공선택",
    "졸업연구",
    "기타",
]

CourseSectorName = Literal[
    "데이터 과학",
    "시스템-네트워크",
    "전산이론",
    "소프트웨어디자인",
    "시큐어컴퓨팅",
    "비주얼컴퓨팅",
    "인공지능/정보서비스",
    "소셜컴퓨팅",
    "인터랙티브컴퓨팅",
]

OfferedSemester = Literal["S", "F"]


class CourseCredit(BaseModel):
    lecture: int
    lab: int
    credit: int
    au: int = 0
    raw: str


class Course(Document):
    course_code: str = Field(min_length=2)
    course_name: str = Field(min_length=1)
    course_name_en: str | None = None
    description: str | None = None
    category: CourseCategoryName
    sectors: list[CourseSectorName] = Field(default_factory=list)
    offered_semesters: list[OfferedSemester] = Field(default_factory=list)
    credit: CourseCredit
    prerequisites: list[str] = Field(default_factory=list)
    is_key_course: bool = False
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "courses"
        indexes = ["course_code", "category", "sectors"]
