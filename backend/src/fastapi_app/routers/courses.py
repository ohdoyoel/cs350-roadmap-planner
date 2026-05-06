from fastapi import APIRouter
from pydantic import BaseModel

from db.models.course import Course, CourseCredit

router = APIRouter(prefix="/courses", tags=["courses"])


class CourseRead(BaseModel):
    id: str
    course_code: str
    course_name: str
    course_name_en: str | None
    category: str
    sectors: list[str]
    offered_semesters: list[str]
    credit: CourseCredit
    prerequisites: list[str]
    is_key_course: bool
    level: int | None


def get_course_level(course_code: str) -> int | None:
    digits = "".join(ch for ch in course_code if ch.isdigit())
    if not digits:
        return None
    return int(digits) // 100 * 100


def serialize_course(course: Course) -> CourseRead:
    return CourseRead(
        id=str(course.id),
        course_code=course.course_code,
        course_name=course.course_name,
        course_name_en=course.course_name_en,
        category=course.category,
        sectors=course.sectors,
        offered_semesters=course.offered_semesters,
        credit=course.credit,
        prerequisites=course.prerequisites,
        is_key_course=course.is_key_course,
        level=get_course_level(course.course_code),
    )


@router.get("", response_model=list[CourseRead])
async def list_courses() -> list[CourseRead]:
    courses = await Course.find_all().sort("+course_code").to_list()
    return [serialize_course(course) for course in courses]


@router.get("/{code}", response_model=CourseRead)
async def get_course(code: str) -> CourseRead:
    course = await Course.find_one(Course.course_code == code.upper())
    if course is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Course not found")
    return serialize_course(course)
