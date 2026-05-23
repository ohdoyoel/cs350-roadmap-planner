from datetime import UTC, datetime

from fastapi import HTTPException, status

from db.models.course import Course
from db.models.roadmap import (
    CatalogRoadmapCourse,
    CustomRoadmapCourse,
    Roadmap,
    RoadmapCourse,
    RoadmapCourseGrade,
)
from fastapi_app.schemas.roadmaps import (
    CatalogRoadmapCourseDTO,
    CustomRoadmapCourseDTO,
    RoadmapCourseDTO,
    RoadmapDTO,
)


def now_utc() -> datetime:
    return datetime.now(UTC)


def normalize_course_code(course_code: str) -> str:
    return course_code.strip().upper()


def serialize_course_item(course: RoadmapCourse) -> RoadmapCourseDTO:
    if course.type == "catalog":
        return CatalogRoadmapCourseDTO(
            type=course.type,
            semester_number=course.semester_number,
            course_code=course.course_code,
            grade=course.grade,
        )

    return CustomRoadmapCourseDTO(
        type=course.type,
        semester_number=course.semester_number,
        course_code=course.course_code,
        title=course.title,
        credit=course.credit,
        category=course.category,
        grade=course.grade,
    )


def serialize_roadmap(roadmap: Roadmap) -> RoadmapDTO:
    return RoadmapDTO(
        id=str(roadmap.id),
        user_id=roadmap.user_id,
        current_semester_number=roadmap.current_semester_number,
        courses=[
            serialize_course_item(course)
            for course in sorted(
                roadmap.courses,
                key=lambda item: (item.semester_number, item.course_code),
            )
        ],
        created_at=roadmap.created_at,
        updated_at=roadmap.updated_at,
    )


async def get_user_roadmap(user_id: str) -> Roadmap | None:
    return await Roadmap.find_one(Roadmap.user_id == user_id)


async def get_or_create_user_roadmap(user_id: str) -> Roadmap:
    roadmap = await get_user_roadmap(user_id)
    if roadmap is not None:
        return roadmap

    roadmap = Roadmap(user_id=user_id)
    await roadmap.insert()
    return roadmap


async def get_my_roadmap(user_id: str) -> RoadmapDTO:
    return serialize_roadmap(await get_or_create_user_roadmap(user_id))


async def update_current_semester(
    user_id: str,
    semester_number: int,
) -> RoadmapDTO:
    roadmap = await get_or_create_user_roadmap(user_id)
    roadmap.current_semester_number = semester_number
    roadmap.updated_at = now_utc()
    await roadmap.save()
    return serialize_roadmap(roadmap)


def ensure_course_slot_available(
    roadmap: Roadmap,
    semester_number: int,
    course_code: str,
    ignore_original: tuple[int, str] | None = None,
) -> None:
    for course in roadmap.courses:
        same_original = (
            ignore_original is not None
            and course.semester_number == ignore_original[0]
            and course.course_code == ignore_original[1]
        )
        if same_original:
            continue
        if course.semester_number == semester_number and course.course_code == course_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Course already exists in this semester",
            )


async def ensure_catalog_course_exists(course_code: str) -> None:
    course = await Course.find_one(Course.course_code == course_code)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )


async def add_course(user_id: str, course: RoadmapCourseDTO) -> RoadmapDTO:
    roadmap = await get_or_create_user_roadmap(user_id)
    course_code = normalize_course_code(course.course_code)
    semester_number = course.semester_number

    if course.type == "catalog":
        await ensure_catalog_course_exists(course_code)

    ensure_course_slot_available(roadmap, semester_number, course_code)

    if course.type == "catalog":
        roadmap.courses.append(
            CatalogRoadmapCourse(
                semester_number=semester_number,
                course_code=course_code,
                grade=course.grade,
            ),
        )
    else:
        roadmap.courses.append(
            CustomRoadmapCourse(
                semester_number=semester_number,
                course_code=course_code,
                title=course.title,
                credit=course.credit,
                category=course.category,
                grade=course.grade,
            ),
        )

    roadmap.updated_at = now_utc()
    await roadmap.save()
    return serialize_roadmap(roadmap)


def find_course_index(
    roadmap: Roadmap,
    semester_number: int,
    course_code: str,
) -> int:
    normalized_code = normalize_course_code(course_code)
    for index, course in enumerate(roadmap.courses):
        if (
            course.semester_number == semester_number
            and course.course_code == normalized_code
        ):
            return index
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Roadmap course not found",
    )


async def move_course(
    user_id: str,
    course_code: str,
    from_semester_number: int,
    to_semester_number: int,
) -> RoadmapDTO:
    roadmap = await get_or_create_user_roadmap(user_id)
    normalized_code = normalize_course_code(course_code)
    index = find_course_index(
        roadmap,
        from_semester_number,
        normalized_code,
    )
    course = roadmap.courses[index]

    ensure_course_slot_available(
        roadmap,
        to_semester_number,
        normalized_code,
        ignore_original=(course.semester_number, normalized_code),
    )

    course.semester_number = to_semester_number
    roadmap.courses[index] = course
    roadmap.updated_at = now_utc()
    await roadmap.save()
    return serialize_roadmap(roadmap)


async def update_course_grade(
    user_id: str,
    semester_number: int,
    course_code: str,
    grade: RoadmapCourseGrade,
) -> RoadmapDTO:
    roadmap = await get_or_create_user_roadmap(user_id)
    index = find_course_index(roadmap, semester_number, course_code)
    course = roadmap.courses[index]
    course.grade = grade
    roadmap.courses[index] = course
    roadmap.updated_at = now_utc()
    await roadmap.save()
    return serialize_roadmap(roadmap)


async def delete_course(
    user_id: str,
    semester_number: int,
    course_code: str,
) -> RoadmapDTO:
    roadmap = await get_or_create_user_roadmap(user_id)
    index = find_course_index(roadmap, semester_number, course_code)
    del roadmap.courses[index]
    roadmap.updated_at = now_utc()
    await roadmap.save()
    return serialize_roadmap(roadmap)
