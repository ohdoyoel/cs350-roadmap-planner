from fastapi import APIRouter
from pydantic import BaseModel

from db.models.course import Course, CourseCredit

router = APIRouter(prefix="/courses", tags=["courses"])


class CourseRead(BaseModel):
    id: str
    code: str
    title: str
    title_en: str | None
    requirement: str
    terms: list[str]
    credits: CourseCredit
    categories: list[str]
    prerequisites: list[str]
    is_key_course: bool


def serialize_course(course: Course) -> CourseRead:
    return CourseRead(
        id=str(course.id),
        code=course.code,
        title=course.title,
        title_en=course.title_en,
        requirement=course.requirement,
        terms=course.terms,
        credits=course.credits,
        categories=course.categories,
        prerequisites=course.prerequisites,
        is_key_course=course.is_key_course,
    )


@router.get("", response_model=list[CourseRead])
async def list_courses() -> list[CourseRead]:
    courses = await Course.find_all().sort("+code").to_list()
    return [serialize_course(course) for course in courses]


@router.get("/{code}", response_model=CourseRead)
async def get_course(code: str) -> CourseRead:
    course = await Course.find_one(Course.code == code.upper())
    if course is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Course not found")
    return serialize_course(course)
