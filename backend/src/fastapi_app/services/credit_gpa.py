from db.models.course import Course
from db.models.roadmap import (
    CatalogRoadmapCourse,
    CustomRoadmapCourse,
    Roadmap,
    RoadmapCourseGrade,
)
from db.models.user_settings import AcademicOption
from fastapi_app.schemas.credit_gpa import (
    CourseStatus,
    CreditGPACourseDTO,
    CreditGPACourseGroupDTO,
    CreditGPACreditsDTO,
    CreditGPADTO,
    CreditGPARequirementDTO,
    RequirementKey,
)
from fastapi_app.services.roadmaps import get_or_create_user_roadmap
from fastapi_app.services.settings import get_user_settings

RequirementDefinition = tuple[RequirementKey, str, int]

REQUIREMENTS_BY_ACADEMIC_OPTION: dict[AcademicOption, list[RequirementDefinition]] = {
    "major": [
        ("basic", "기초", 6),
        ("major_required", "전공필수", 19),
        ("major_elective", "전공선택", 30),
        ("capstone", "캡스톤", 1),
        ("graduation_research", "졸업연구", 3),
    ],
    "minor": [
        ("basic", "기초", 3),
        ("major_required", "전공필수", 15),
        ("major_total", "전공필수+전공선택", 21),
    ],
    "double_major": [
        ("basic", "기초", 6),
        ("major_required", "전공필수", 19),
        ("major_total", "전공필수+전공선택", 40),
        ("capstone", "캡스톤", 1),
    ],
}

CATEGORY_TO_REQUIREMENT: dict[str, RequirementKey] = {
    "기초필수": "basic",
    "기초선택": "basic",
    "전공필수": "major_required",
    "전공선택": "major_elective",
    "졸업연구": "graduation_research",
}

BASIC_REQUIRED_GROUPS = [
    {"course_codes": {"CS101"}, "credit": 3},
    {"course_codes": {"MAS109", "MAS110"}, "credit": 3},
]

MINOR_BASIC_REQUIRED_GROUPS = [
    {"course_codes": {"CS101"}, "credit": 3},
]

CAPSTONE_COURSE_CODES = {
    "CS350",
    "CS360",
    "CS374",
    "CS408",
    "CS409",
    "CS423",
    "CS442",
    "CS453",
    "CS454",
    "CS457",
    "CS459",
    "CS473",
    "CS474",
    "CS482",
}

GPA_POINTS = {
    "A+": 4.3,
    "A0": 4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B0": 3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C0": 2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D0": 1.0,
    "D-": 0.7,
    "F": 0.0,
}

EARNED_GRADES = {
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
    "S",
}


def get_course_status(
    semester_number: int,
    current_semester_number: int,
    grade: RoadmapCourseGrade,
) -> CourseStatus:
    if semester_number == current_semester_number:
        return "in_progress"
    if semester_number > current_semester_number:
        return "planned"
    if grade == "PLANNED":
        return "missing_grade"
    return "completed"


def is_earned_completed_course(course: CreditGPACourseDTO) -> bool:
    if course.status == "missing_grade" and course.grade == "PLANNED":
        return True
    return course.status == "completed" and course.grade in EARNED_GRADES


def is_in_progress_course(course: CreditGPACourseDTO) -> bool:
    return course.status == "in_progress"


def get_requirement_key(category: str) -> RequirementKey | None:
    return CATEGORY_TO_REQUIREMENT.get(category)


async def load_catalog_courses_by_code(
    course_codes: set[str],
) -> dict[str, Course]:
    if not course_codes:
        return {}

    courses = await Course.find(
        {"course_code": {"$in": sorted(course_codes)}},
    ).to_list()
    return {course.course_code: course for course in courses}


def build_catalog_analysis_course(
    roadmap_course: CatalogRoadmapCourse,
    catalog_course: Course,
    current_semester_number: int,
) -> CreditGPACourseDTO:
    return CreditGPACourseDTO(
        type="catalog",
        course_code=roadmap_course.course_code,
        title=catalog_course.course_name,
        title_en=catalog_course.course_name_en,
        semester_number=roadmap_course.semester_number,
        category=catalog_course.category,
        credit=catalog_course.credit.credit,
        grade=roadmap_course.grade,
        status=get_course_status(
            roadmap_course.semester_number,
            current_semester_number,
            roadmap_course.grade,
        ),
    )


def build_custom_analysis_course(
    roadmap_course: CustomRoadmapCourse,
    current_semester_number: int,
) -> CreditGPACourseDTO:
    return CreditGPACourseDTO(
        type="custom",
        course_code=roadmap_course.course_code,
        title=roadmap_course.title,
        title_en=None,
        semester_number=roadmap_course.semester_number,
        category=roadmap_course.category,
        credit=roadmap_course.credit,
        grade=roadmap_course.grade,
        status=get_course_status(
            roadmap_course.semester_number,
            current_semester_number,
            roadmap_course.grade,
        ),
    )


async def build_analysis_courses(roadmap: Roadmap) -> list[CreditGPACourseDTO]:
    catalog_codes = {
        course.course_code
        for course in roadmap.courses
        if course.type == "catalog"
    }
    catalog_courses = await load_catalog_courses_by_code(catalog_codes)

    result: list[CreditGPACourseDTO] = []
    for roadmap_course in roadmap.courses:
        if roadmap_course.type == "catalog":
            catalog_course = catalog_courses.get(roadmap_course.course_code)
            if catalog_course is None:
                continue
            result.append(
                build_catalog_analysis_course(
                    roadmap_course,
                    catalog_course,
                    roadmap.current_semester_number,
                ),
            )
        else:
            result.append(
                build_custom_analysis_course(
                    roadmap_course,
                    roadmap.current_semester_number,
                ),
            )

    return sorted(
        result,
        key=lambda course: (course.semester_number, course.course_code),
    )


def get_requirements(
    academic_option: AcademicOption,
) -> list[RequirementDefinition]:
    return REQUIREMENTS_BY_ACADEMIC_OPTION[academic_option]


def get_basic_required_groups(
    academic_option: AcademicOption,
) -> list[dict[str, object]]:
    if academic_option == "minor":
        return MINOR_BASIC_REQUIRED_GROUPS
    return BASIC_REQUIRED_GROUPS


def calculate_basic_requirement(
    courses: list[CreditGPACourseDTO],
    academic_option: AcademicOption,
) -> tuple[int, int]:
    completed = 0
    in_progress = 0

    for group in get_basic_required_groups(academic_option):
        group_courses = [
            course
            for course in courses
            if course.course_code in group["course_codes"]  # type: ignore[operator]
        ]
        if any(is_earned_completed_course(course) for course in group_courses):
            completed += int(group["credit"])
        elif any(is_in_progress_course(course) for course in group_courses):
            in_progress += int(group["credit"])

    return completed, in_progress


def is_major_course(course: CreditGPACourseDTO) -> bool:
    return get_requirement_key(course.category) in {"major_required", "major_elective"}


def calculate_major_total_remainder_requirement(
    courses: list[CreditGPACourseDTO],
) -> tuple[int, int]:
    completed_total = sum(
        course.credit
        for course in courses
        if is_major_course(course) and is_earned_completed_course(course)
    )
    completed_and_in_progress_total = completed_total + sum(
        course.credit
        for course in courses
        if is_major_course(course) and is_in_progress_course(course)
    )
    return completed_total, completed_and_in_progress_total - completed_total


def calculate_capstone_requirement(
    courses: list[CreditGPACourseDTO],
) -> tuple[int, int]:
    capstone_courses = [
        course
        for course in courses
        if course.course_code in CAPSTONE_COURSE_CODES
    ]
    if any(is_earned_completed_course(course) for course in capstone_courses):
        return 1, 0
    if any(is_in_progress_course(course) for course in capstone_courses):
        return 0, 1
    return 0, 0


def calculate_category_requirement(
    courses: list[CreditGPACourseDTO],
    key: RequirementKey,
) -> tuple[int, int]:
    matching_courses = [
        course
        for course in courses
        if get_requirement_key(course.category) == key
    ]
    completed = sum(
        course.credit
        for course in matching_courses
        if is_earned_completed_course(course)
    )
    in_progress = sum(
        course.credit
        for course in matching_courses
        if is_in_progress_course(course)
    )
    return completed, in_progress


def build_requirements(
    courses: list[CreditGPACourseDTO],
    academic_option: AcademicOption = "major",
) -> list[CreditGPARequirementDTO]:
    requirements: list[CreditGPARequirementDTO] = []
    requirement_definitions = get_requirements(academic_option)

    for key, label, required_credits in requirement_definitions:
        if key == "basic":
            completed, in_progress = calculate_basic_requirement(
                courses,
                academic_option,
            )
        elif key == "major_total":
            completed, in_progress = calculate_major_total_remainder_requirement(courses)
        elif key == "capstone":
            completed, in_progress = calculate_capstone_requirement(courses)
        else:
            completed, in_progress = calculate_category_requirement(courses, key)

        requirements.append(
            CreditGPARequirementDTO(
                key=key,
                label=label,
                required_credits=required_credits,
                completed_credits=completed,
                in_progress_credits=in_progress,
                remaining_credits=max(
                    0,
                    required_credits - completed - in_progress,
                ),
            ),
        )

    return requirements


def calculate_gpa(courses: list[CreditGPACourseDTO]) -> float | None:
    total_points = 0.0
    total_credits = 0

    for course in courses:
        if course.status != "completed" or course.grade not in GPA_POINTS:
            continue
        total_points += GPA_POINTS[course.grade] * course.credit
        total_credits += course.credit

    if total_credits == 0:
        return None
    return round(total_points / total_credits, 2)


def build_course_groups(
    courses: list[CreditGPACourseDTO],
    academic_option: AcademicOption = "major",
) -> list[CreditGPACourseGroupDTO]:
    groups: dict[RequirementKey, list[CreditGPACourseDTO]] = {
        key: []
        for key, _, _ in get_requirements(academic_option)
    }

    for course in courses:
        key = get_requirement_key(course.category)
        if key in groups:
            groups[key].append(course)
        if "major_total" in groups and is_major_course(course):
            groups["major_total"].append(course)
        if "capstone" in groups and course.course_code in CAPSTONE_COURSE_CODES:
            groups["capstone"].append(course)

    return [
        CreditGPACourseGroupDTO(key=key, label=label, items=groups[key])
        for key, label, _ in get_requirements(academic_option)
    ]


async def get_my_credit_gpa(user_id: str) -> CreditGPADTO:
    roadmap = await get_or_create_user_roadmap(user_id)
    settings = await get_user_settings(user_id)
    academic_option = settings.academic_option if settings is not None else "major"
    courses = await build_analysis_courses(roadmap)
    requirements = build_requirements(courses, academic_option)

    completed_credits = sum(
        course.credit
        for course in courses
        if is_earned_completed_course(course)
    )
    in_progress_credits = sum(
        course.credit
        for course in courses
        if is_in_progress_course(course)
    )
    remaining_credits = sum(
        requirement.remaining_credits
        for requirement in requirements
    )

    return CreditGPADTO(
        current_semester_number=roadmap.current_semester_number,
        academic_option=academic_option,
        credits=CreditGPACreditsDTO(
            completed=completed_credits,
            in_progress=in_progress_credits,
            remaining=remaining_credits,
        ),
        gpa=calculate_gpa(courses),
        requirements=requirements,
        courses=build_course_groups(courses, academic_option),
    )
