from fastapi import APIRouter, HTTPException, Query
from fastapi_app.schemas.courses import CourseCategoryDTO, CourseDTO, CourseSectorDTO
from fastapi_app.services import courses as course_service

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseDTO])
async def list_courses(
    query: str | None = Query(default=None, alias="q"),
    category: str | None = None,
    sector: str | None = None,
    offered_semester: str | None = Query(default=None, alias="offeredSemester"),
    is_key_course: bool | None = Query(default=None, alias="isKeyCourse"),
    level: int | None = None,
    include_prerequisites: bool = Query(
        default=False,
        alias="includePrerequisites",
    ),
) -> list[CourseDTO]:
    return await course_service.list_courses(
        query=query,
        category=category,
        sector=sector,
        offered_semester=offered_semester,
        is_key_course=is_key_course,
        level=level,
        include_prerequisites=include_prerequisites,
    )


@router.get("/categories", response_model=list[CourseCategoryDTO])
async def list_categories() -> list[CourseCategoryDTO]:
    return await course_service.list_categories()


@router.get("/sectors", response_model=list[CourseSectorDTO])
async def list_sectors() -> list[CourseSectorDTO]:
    return await course_service.list_sectors()


@router.get("/{code}", response_model=CourseDTO)
async def get_course(code: str) -> CourseDTO:
    course = await course_service.get_course(code)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
