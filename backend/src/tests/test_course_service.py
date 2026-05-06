from unittest.mock import patch
from types import SimpleNamespace
import unittest

from db.models.course import CourseCredit
from fastapi_app.schemas.courses import CourseDTO
from fastapi_app.services.courses import (
    expand_prerequisite_codes,
    filter_course_codes,
    get_course_level,
    list_courses,
)


def course(
    course_code: str,
    course_name: str,
    course_name_en: str | None = None,
    category: str = "전공선택",
    sectors: list[str] | None = None,
    offered_semesters: list[str] | None = None,
    prerequisites: list[str] | None = None,
    is_key_course: bool = False,
) -> SimpleNamespace:
    return SimpleNamespace(
        id=course_code,
        course_code=course_code,
        course_name=course_name,
        course_name_en=course_name_en,
        category=category,
        sectors=sectors or [],
        offered_semesters=offered_semesters or [],
        credit=CourseCredit(
            lecture=3,
            lab=0,
            credit=3,
            au=0,
            raw="3:0:3(0)",
        ),
        prerequisites=prerequisites or [],
        is_key_course=is_key_course,
    )


class CourseServiceTest(unittest.TestCase):
    def setUp(self) -> None:
        self.courses = [
            course(
                "CS204",
                "이산구조",
                "Discrete Mathematics",
                category="전공필수",
                sectors=["전산이론"],
                offered_semesters=["S", "F"],
            ),
            course(
                "CS300",
                "알고리즘 개론",
                "Introduction to Algorithms",
                category="전공필수",
                sectors=["전산이론"],
                offered_semesters=["S", "F"],
                prerequisites=["CS204"],
            ),
            course(
                "CS423",
                "AI 확률적 프로그래밍",
                "Probabilistic Programming",
                sectors=["인공지능/정보서비스"],
                offered_semesters=["S"],
                prerequisites=["CS300"],
                is_key_course=True,
            ),
        ]

    def test_get_course_level_from_code(self) -> None:
        self.assertEqual(get_course_level("CS101"), 100)
        self.assertEqual(get_course_level("CS300"), 300)
        self.assertEqual(get_course_level("MAS110"), 100)
        self.assertIsNone(get_course_level("ABC"))

    def test_filter_course_codes_matches_query_and_filters(self) -> None:
        self.assertEqual(
            filter_course_codes(self.courses, query="algorithm"),
            {"CS300"},
        )
        self.assertEqual(
            filter_course_codes(self.courses, sector="인공지능/정보서비스"),
            {"CS423"},
        )
        self.assertEqual(
            filter_course_codes(self.courses, category="전공필수", level=300),
            {"CS300"},
        )
        self.assertEqual(
            filter_course_codes(
                self.courses,
                offered_semester="S",
                is_key_course=True,
            ),
            {"CS423"},
        )

    def test_expand_prerequisite_codes_recursively(self) -> None:
        courses_by_code = {item.course_code: item for item in self.courses}

        self.assertEqual(
            expand_prerequisite_codes({"CS423"}, courses_by_code),
            {"CS423", "CS300", "CS204"},
        )

    def test_course_dto_serializes_camel_case(self) -> None:
        dto = CourseDTO(
            id="1",
            course_code="CS300",
            course_name="알고리즘 개론",
            course_name_en="Introduction to Algorithms",
            category="전공필수",
            sectors=["전산이론"],
            offered_semesters=["S", "F"],
            credit=CourseCredit(
                lecture=3,
                lab=0,
                credit=3,
                au=0,
                raw="3:0:3(0)",
            ),
            prerequisites=["CS204"],
            is_key_course=False,
            level=300,
        )

        dumped = dto.model_dump(by_alias=True)
        self.assertIn("courseCode", dumped)
        self.assertIn("courseName", dumped)
        self.assertIn("courseNameEn", dumped)
        self.assertIn("offeredSemesters", dumped)
        self.assertIn("isKeyCourse", dumped)
        self.assertNotIn("course_code", dumped)


class CourseListApiParameterTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.courses = [
            course(
                "CS204",
                "이산구조",
                "Discrete Mathematics",
                category="전공필수",
                sectors=["전산이론"],
                offered_semesters=["S", "F"],
            ),
            course(
                "CS300",
                "알고리즘 개론",
                "Introduction to Algorithms",
                category="전공필수",
                sectors=["전산이론"],
                offered_semesters=["S", "F"],
                prerequisites=["CS204"],
            ),
            course(
                "CS423",
                "AI 확률적 프로그래밍",
                "Probabilistic Programming",
                sectors=["인공지능/정보서비스"],
                offered_semesters=["S"],
                prerequisites=["CS300"],
                is_key_course=True,
            ),
            course(
                "CS481",
                "데이터 시각화",
                "Data Visualization",
                sectors=["전산이론"],
                offered_semesters=["F"],
            ),
        ]

    async def test_list_courses_applies_query_parameter(self) -> None:
        with patch(
            "fastapi_app.services.courses.load_courses",
            return_value=self.courses,
        ):
            result = await list_courses(query="visual")

        self.assertEqual([course.course_code for course in result], ["CS481"])
        self.assertTrue(result[0].matched)

    async def test_list_courses_applies_all_filter_parameters_together(self) -> None:
        with patch(
            "fastapi_app.services.courses.load_courses",
            return_value=self.courses,
        ):
            result = await list_courses(
                query="probabilistic",
                category="전공선택",
                sector="인공지능/정보서비스",
                offered_semester="S",
                is_key_course=True,
                level=400,
            )

        self.assertEqual([course.course_code for course in result], ["CS423"])
        self.assertTrue(result[0].matched)

    async def test_list_courses_includes_prerequisites_when_requested(self) -> None:
        with patch(
            "fastapi_app.services.courses.load_courses",
            return_value=self.courses,
        ):
            result = await list_courses(
                query="probabilistic",
                include_prerequisites=True,
            )

        self.assertEqual(
            [(course.course_code, course.matched) for course in result],
            [
                ("CS204", False),
                ("CS300", False),
                ("CS423", True),
            ],
        )


if __name__ == "__main__":
    unittest.main()
