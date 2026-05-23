import os
import unittest
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from db.client import load_dotenv
from db.models.auth_session import AuthSession
from db.models.course import Course, CourseCredit
from db.models.roadmap import CatalogRoadmapCourse
from db.models.user import User
from db.models.user_settings import UserSettings
from fastapi_app.main import app
from fastapi_app.schemas.credit_gpa import CreditGPACourseDTO
from fastapi_app.services import credit_gpa as credit_gpa_service
from fastapi_app.services import roadmaps as roadmap_service

load_dotenv()


class FakeRoadmap(SimpleNamespace):
    save_count: int = 0

    async def save(self) -> None:
        self.save_count += 1


def roadmap_with_courses(
    courses: list[CatalogRoadmapCourse] | None = None,
) -> FakeRoadmap:
    now = datetime.now(UTC)
    return FakeRoadmap(
        id="roadmap-id",
        user_id="user-id",
        current_semester_number=1,
        courses=courses or [],
        created_at=now,
        updated_at=now,
        save_count=0,
    )


class CreditGPAServiceTest(unittest.IsolatedAsyncioTestCase):
    def analysis_course(
        self,
        course_code: str,
        semester_number: int,
        category: str,
        grade: str = "PLANNED",
        credit: int = 3,
        status: str = "planned",
    ) -> CreditGPACourseDTO:
        return CreditGPACourseDTO(
            type="catalog",
            course_code=course_code,
            title=course_code,
            title_en=None,
            semester_number=semester_number,
            category=category,
            credit=credit,
            grade=grade,
            status=status,
        )

    def test_basic_requirement_counts_mas109_or_mas110_once(self) -> None:
        courses = [
            self.analysis_course("CS101", 1, "기초필수", "A0", status="completed"),
            self.analysis_course("MAS109", 1, "기초필수", "A0", status="completed"),
            self.analysis_course("MAS110", 2, "기초필수", "A0", status="completed"),
        ]

        requirements = credit_gpa_service.build_requirements(courses)
        basic = requirements[0]

        self.assertEqual(basic.key, "basic")
        self.assertEqual(basic.required_credits, 6)
        self.assertEqual(basic.completed_credits, 6)
        self.assertEqual(basic.in_progress_credits, 0)
        self.assertEqual(basic.remaining_credits, 0)

    def test_requirements_use_completed_and_in_progress_only(self) -> None:
        courses = [
            self.analysis_course(
                "CS300",
                1,
                "전공필수",
                "A0",
                status="completed",
                credit=3,
            ),
            self.analysis_course(
                "CS350",
                3,
                "전공선택",
                status="in_progress",
                credit=3,
            ),
            self.analysis_course(
                "CS360",
                5,
                "전공선택",
                status="planned",
                credit=3,
            ),
        ]

        requirements = {
            requirement.key: requirement
            for requirement in credit_gpa_service.build_requirements(courses)
        }

        self.assertEqual(requirements["major_required"].completed_credits, 3)
        self.assertEqual(requirements["major_required"].remaining_credits, 16)
        self.assertEqual(requirements["major_elective"].in_progress_credits, 3)
        self.assertEqual(requirements["major_elective"].remaining_credits, 27)

    def test_gpa_uses_completed_letter_grades_only(self) -> None:
        courses = [
            self.analysis_course("CS101", 1, "전공필수", "A0", status="completed"),
            self.analysis_course("CS102", 2, "전공필수", "B0", status="completed"),
            self.analysis_course("CS103", 3, "전공필수", "A+", status="in_progress"),
            self.analysis_course("CS104", 1, "전공필수", "S", status="completed"),
        ]

        self.assertEqual(credit_gpa_service.calculate_gpa(courses), 3.5)

    def test_missing_grade_counts_as_completed_credit_but_not_gpa(self) -> None:
        courses = [
            self.analysis_course(
                "CS300",
                1,
                "전공필수",
                "PLANNED",
                status="missing_grade",
            ),
            self.analysis_course("CS301", 2, "전공필수", "A0", status="completed"),
        ]

        requirements = {
            requirement.key: requirement
            for requirement in credit_gpa_service.build_requirements(courses)
        }

        self.assertEqual(requirements["major_required"].completed_credits, 6)
        self.assertEqual(credit_gpa_service.calculate_gpa(courses), 4.0)

    async def test_get_my_credit_gpa_groups_courses_and_summarizes(self) -> None:
        roadmap = roadmap_with_courses(
            [
                CatalogRoadmapCourse(
                    semester_number=1,
                    course_code="CS101",
                    grade="A0",
                ),
                CatalogRoadmapCourse(
                    semester_number=2,
                    course_code="MAS109",
                    grade="A0",
                ),
                CatalogRoadmapCourse(
                    semester_number=3,
                    course_code="CS350",
                ),
            ],
        )
        roadmap.current_semester_number = 3
        catalog_courses = {
            "CS101": SimpleNamespace(
                course_code="CS101",
                course_name="Intro CS",
                course_name_en="Introduction to Computer Science",
                category="기초필수",
                credit=SimpleNamespace(credit=3),
            ),
            "MAS109": SimpleNamespace(
                course_code="MAS109",
                course_name="Linear Algebra",
                course_name_en="Linear Algebra",
                category="기초필수",
                credit=SimpleNamespace(credit=3),
            ),
            "CS350": SimpleNamespace(
                course_code="CS350",
                course_name="Software Engineering",
                course_name_en="Introduction to Software Engineering",
                category="전공선택",
                credit=SimpleNamespace(credit=3),
            ),
        }

        with (
            patch(
                "fastapi_app.services.credit_gpa.get_or_create_user_roadmap",
                new=AsyncMock(return_value=roadmap),
            ),
            patch(
                "fastapi_app.services.credit_gpa.load_catalog_courses_by_code",
                new=AsyncMock(return_value=catalog_courses),
            ),
        ):
            result = await credit_gpa_service.get_my_credit_gpa("user-id")

        dumped = result.model_dump(by_alias=True)
        self.assertEqual(dumped["currentSemester"], "2-1")
        self.assertEqual(dumped["credits"], {
            "completed": 6,
            "inProgress": 3,
            "remaining": 49,
        })
        self.assertEqual(dumped["gpa"], 4.0)
        self.assertEqual(
            [group["key"] for group in dumped["courses"]],
            ["basic", "major_required", "major_elective", "graduation_research"],
        )
        self.assertEqual(len(dumped["courses"][0]["items"]), 2)
        self.assertEqual(dumped["courses"][2]["items"][0]["status"], "in_progress")


def integration_tests_enabled() -> bool:
    return os.getenv("RUN_INTEGRATION_TESTS") == "1"


async def clear_credit_gpa_integration_collections() -> None:
    await roadmap_service.Roadmap.delete_all()
    await Course.delete_all()
    await AuthSession.delete_all()
    await UserSettings.delete_all()
    await User.delete_all()


async def seed_catalog_courses() -> None:
    await Course(
        course_code="CS101",
        course_name="Intro CS",
        course_name_en="Introduction to Computer Science",
        category="기초필수",
        credit=CourseCredit(lecture=3, lab=0, credit=3, au=0, raw="3:0:3(0)"),
    ).insert()
    await Course(
        course_code="MAS109",
        course_name="Linear Algebra",
        course_name_en="Linear Algebra",
        category="기초필수",
        credit=CourseCredit(lecture=3, lab=0, credit=3, au=0, raw="3:0:3(0)"),
    ).insert()
    await Course(
        course_code="CS350",
        course_name="Software Engineering",
        course_name_en="Introduction to Software Engineering",
        category="전공선택",
        credit=CourseCredit(lecture=3, lab=0, credit=3, au=0, raw="3:0:3(0)"),
    ).insert()


@unittest.skipUnless(
    integration_tests_enabled(),
    "set RUN_INTEGRATION_TESTS=1 to run credit-GPA API integration tests",
)
class CreditGPAApiIntegrationTest(unittest.TestCase):
    client: TestClient

    @classmethod
    def setUpClass(cls) -> None:
        test_database = os.getenv("TEST_MONGODB_DATABASE")
        if test_database is None or test_database == "":
            raise RuntimeError("Missing required environment variable: TEST_MONGODB_DATABASE")
        if not test_database.endswith("_test"):
            raise RuntimeError("TEST_MONGODB_DATABASE must end with '_test'")

        os.environ["MONGODB_DATABASE"] = test_database
        os.environ.setdefault("PASSWORD_PEPPER", "integration-test-pepper")

        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client.portal.call(clear_credit_gpa_integration_collections)
        cls.client.__exit__(None, None, None)

    def setUp(self) -> None:
        self.client.portal.call(clear_credit_gpa_integration_collections)
        self.client.portal.call(seed_catalog_courses)

        signup_response = self.client.post(
            "/auth/signup",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )
        self.assertEqual(signup_response.status_code, 200)
        self.token = signup_response.json()["sessionToken"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_credit_gpa_api_summarizes_roadmap(self) -> None:
        self.client.post(
            "/roadmap/me/courses",
            json={
                "type": "catalog",
                "semester": "1-1",
                "courseCode": "CS101",
                "grade": "A0",
            },
            headers=self.headers,
        )
        self.client.post(
            "/roadmap/me/courses",
            json={
                "type": "catalog",
                "semester": "1-2",
                "courseCode": "MAS109",
                "grade": "A0",
            },
            headers=self.headers,
        )
        self.client.post(
            "/roadmap/me/courses",
            json={
                "type": "catalog",
                "semester": "2-1",
                "courseCode": "CS350",
            },
            headers=self.headers,
        )
        self.client.patch(
            "/roadmap/me/current-semester",
            params={"semester": "2-1"},
            headers=self.headers,
        )

        response = self.client.get("/credit-gpa/me", headers=self.headers)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["currentSemester"], "2-1")
        self.assertEqual(body["credits"], {
            "completed": 6,
            "inProgress": 3,
            "remaining": 49,
        })
        self.assertEqual(body["gpa"], 4.0)
        self.assertEqual(
            [requirement["label"] for requirement in body["requirements"]],
            ["기초", "전공필수", "전공선택", "졸업연구"],
        )
        self.assertEqual(len(body["courses"][0]["items"]), 2)
        self.assertEqual(body["courses"][2]["items"][0]["status"], "in_progress")


if __name__ == "__main__":
    unittest.main()
