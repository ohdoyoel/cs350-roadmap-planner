from fastapi import APIRouter, Depends, Path, Query

from db.models.user import User
from db.models.roadmap import RoadmapCourseGrade
from fastapi_app.dependencies import get_current_user
from fastapi_app.schemas.roadmaps import (
    RoadmapCourseDTO,
    RoadmapDTO,
    semester_label_to_number,
)
from fastapi_app.services import roadmaps as roadmap_service

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.get("/me", response_model=RoadmapDTO)
async def get_my_roadmap(
    current_user: User = Depends(get_current_user),
) -> RoadmapDTO:
    return await roadmap_service.get_my_roadmap(str(current_user.id))


@router.patch("/me/current-semester", response_model=RoadmapDTO)
async def update_current_semester(
    semester: str = Query(min_length=3),
    current_user: User = Depends(get_current_user),
) -> RoadmapDTO:
    return await roadmap_service.update_current_semester(
        str(current_user.id),
        semester_label_to_number(semester),
    )


@router.post("/me/courses", response_model=RoadmapDTO)
async def add_course(
    course: RoadmapCourseDTO,
    current_user: User = Depends(get_current_user),
) -> RoadmapDTO:
    return await roadmap_service.add_course(str(current_user.id), course)


@router.post("/me/courses/move", response_model=RoadmapDTO)
async def move_course(
    course_code: str = Query(min_length=1, alias="courseCode"),
    from_semester: str = Query(min_length=3, alias="fromSemester"),
    to_semester: str = Query(min_length=3, alias="toSemester"),
    current_user: User = Depends(get_current_user),
) -> RoadmapDTO:
    return await roadmap_service.move_course(
        str(current_user.id),
        course_code,
        semester_label_to_number(from_semester),
        semester_label_to_number(to_semester),
    )


@router.patch(
    "/me/courses/{semester}/{course_code}/grade",
    response_model=RoadmapDTO,
)
async def update_course_grade(
    semester: str = Path(min_length=3),
    course_code: str = Path(min_length=1),
    grade: RoadmapCourseGrade = Query(),
    current_user: User = Depends(get_current_user),
) -> RoadmapDTO:
    return await roadmap_service.update_course_grade(
        str(current_user.id),
        semester_label_to_number(semester),
        course_code,
        grade,
    )


@router.delete(
    "/me/courses/{semester}/{course_code}",
    response_model=RoadmapDTO,
)
async def delete_course(
    semester: str = Path(min_length=3),
    course_code: str = Path(min_length=1),
    current_user: User = Depends(get_current_user),
) -> RoadmapDTO:
    return await roadmap_service.delete_course(
        str(current_user.id),
        semester_label_to_number(semester),
        course_code,
    )
