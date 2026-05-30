from db.models.course import Course
from db.models.course_category import CourseCategory
from db.models.course_sector import CourseSector
from fastapi_app.schemas.courses import (
    CourseCategoryDTO,
    CourseDTO,
    CourseSectorDTO,
)


type CourseLike = Course


def get_course_level(course_code: str) -> int | None:
    digits = "".join(ch for ch in course_code if ch.isdigit())
    if not digits:
        return None
    return int(digits) // 100 * 100


def serialize_course(course: Course, matched: bool = True) -> CourseDTO:
    return CourseDTO(
        id=str(course.id),
        course_code=course.course_code,
        course_name=course.course_name,
        course_name_en=course.course_name_en,
        description=course.description,
        category=course.category,
        sectors=course.sectors,
        offered_semesters=course.offered_semesters,
        credit=course.credit,
        prerequisites=course.prerequisites,
        is_key_course=course.is_key_course,
        level=get_course_level(course.course_code),
        matched=matched,
    )


def course_matches_query(course: Course, query: str) -> bool:
    normalized_query = query.casefold()
    values = [
        course.course_code,
        course.course_name,
        course.course_name_en or "",
    ]
    return any(normalized_query in value.casefold() for value in values)


def course_matches_level(course: Course, level: int) -> bool:
    return get_course_level(course.course_code) == level


def filter_course_codes(
    courses: list[CourseLike],
    query: str | None = None,
    category: str | None = None,
    sector: str | None = None,
    offered_semester: str | None = None,
    is_key_course: bool | None = None,
    level: int | None = None,
) -> set[str]:
    return {
        course.course_code
        for course in courses
        if (query is None or course_matches_query(course, query))
        and (category is None or course.category == category)
        and (sector is None or sector in course.sectors)
        and (
            offered_semester is None
            or offered_semester in course.offered_semesters
        )
        and (is_key_course is None or course.is_key_course == is_key_course)
        and (level is None or course_matches_level(course, level))
    }


def expand_prerequisite_codes(
    matched_codes: set[str],
    courses_by_code: dict[str, CourseLike],
) -> set[str]:
    result_codes = set(matched_codes)
    pending = list(matched_codes)

    while pending:
        course_code = pending.pop()
        course = courses_by_code.get(course_code)
        if course is None:
            continue

        for prerequisite in course.prerequisites:
            if prerequisite not in courses_by_code or prerequisite in result_codes:
                continue
            result_codes.add(prerequisite)
            pending.append(prerequisite)

    return result_codes


async def list_courses(
    query: str | None = None,
    category: str | None = None,
    sector: str | None = None,
    offered_semester: str | None = None,
    is_key_course: bool | None = None,
    level: int | None = None,
    include_prerequisites: bool = False,
) -> list[CourseDTO]:
    courses = await load_courses()
    courses_by_code = {course.course_code: course for course in courses}

    matched_codes = filter_course_codes(
        courses,
        query=query,
        category=category,
        sector=sector,
        offered_semester=offered_semester,
        is_key_course=is_key_course,
        level=level,
    )

    result_codes = (
        expand_prerequisite_codes(matched_codes, courses_by_code)
        if include_prerequisites
        else set(matched_codes)
    )
    return [
        serialize_course(courses_by_code[course_code], course_code in matched_codes)
        for course_code in sorted(result_codes)
        if course_code in courses_by_code
    ]


async def load_courses() -> list[Course]:
    return await Course.find_all().sort("+course_code").to_list()


async def get_course(course_code: str) -> CourseDTO | None:
    course = await Course.find_one(Course.course_code == course_code.upper())
    if course is None:
        return None
    return serialize_course(course)


async def list_categories() -> list[CourseCategoryDTO]:
    categories = await CourseCategory.find_all().sort("+order").to_list()
    courses = await Course.find_all().to_list()
    counts: dict[str, int] = {}
    for course in courses:
        counts[course.category] = counts.get(course.category, 0) + 1

    return [
        CourseCategoryDTO(
            category=category.category,
            name_en=category.name_en,
            order=category.order,
            course_count=counts.get(category.category, 0),
        )
        for category in categories
    ]


async def list_sectors() -> list[CourseSectorDTO]:
    sectors = await CourseSector.find_all().sort("+order").to_list()
    courses = await Course.find_all().to_list()
    counts: dict[str, int] = {}
    for course in courses:
        for sector in course.sectors:
            counts[sector] = counts.get(sector, 0) + 1

    return [
        CourseSectorDTO(
            sector=sector.sector,
            name_en=sector.name_en,
            order=sector.order,
            course_count=counts.get(sector.sector, 0),
        )
        for sector in sectors
    ]
