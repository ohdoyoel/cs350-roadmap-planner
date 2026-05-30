import os
import unittest
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import TypeAdapter

from db.client import load_dotenv
from db.models.auth_session import AuthSession
from db.models.course import Course, CourseCredit
from db.models.roadmap import CatalogRoadmapCourse
from db.models.user import User
from db.models.user_settings import UserSettings
from fastapi_app.main import app
from fastapi_app.schemas.roadmaps import (
    RoadmapCourseDTO,
    RoadmapDTO,
    semester_label_to_number,
    semester_number_to_label,
)
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


class SemesterLabelTest(unittest.TestCase):
    def test_semester_number_serializes_to_academic_label(self) -> None:
        self.assertEqual(semester_number_to_label(1), "1-1")
        self.assertEqual(semester_number_to_label(2), "1-2")
        self.assertEqual(semester_number_to_label(3), "2-1")
        self.assertEqual(semester_number_to_label(8), "4-2")

    def test_semester_label_parses_to_internal_number(self) -> None:
        self.assertEqual(semester_label_to_number("1-1"), 1)
        self.assertEqual(semester_label_to_number("1-2"), 2)
        self.assertEqual(semester_label_to_number("2-1"), 3)
        self.assertEqual(semester_label_to_number("4-2"), 8)

    def test_semester_label_rejects_invalid_term(self) -> None:
        with self.assertRaises(ValueError):
            semester_label_to_number("1-3")


class RoadmapSchemaTest(unittest.TestCase):
    def test_course_dto_accepts_and_serializes_semester_label(self) -> None:
        dto = TypeAdapter(RoadmapCourseDTO).validate_python(
            {
                "type": "catalog",
                "semester": "2-1",
                "courseCode": "CS350",
            },
        )

        self.assertEqual(dto.semester_number, 3)
        self.assertEqual(
            dto.model_dump(by_alias=True),
            {
                "type": "catalog",
                "semester": "2-1",
                "courseCode": "CS350",
                "grade": "PLANNED",
            },
        )

    def test_roadmap_dto_serializes_current_semester_label(self) -> None:
        now = datetime.now(UTC)
        dto = RoadmapDTO(
            id="roadmap-id",
            user_id="user-id",
            current_semester_number=3,
            courses=[],
            created_at=now,
            updated_at=now,
        )

        dumped = dto.model_dump(by_alias=True)
        self.assertEqual(dumped["currentSemester"], "2-1")
        self.assertNotIn("current_semester_number", dumped)


class RoadmapServiceTest(unittest.IsolatedAsyncioTestCase):
    async def test_add_catalog_course_normalizes_code_and_saves(self) -> None:
        roadmap = roadmap_with_courses()
        course = TypeAdapter(RoadmapCourseDTO).validate_python(
            {
                "type": "catalog",
                "semester": "2-1",
                "courseCode": " cs350 ",
            },
        )

        with (
            patch(
                "fastapi_app.services.roadmaps.get_or_create_user_roadmap",
                new=AsyncMock(return_value=roadmap),
            ),
            patch(
                "fastapi_app.services.roadmaps.ensure_catalog_course_exists",
                new=AsyncMock(),
            ) as ensure_exists,
            patch(
                "fastapi_app.services.roadmaps.get_prerequisite_warnings",
                new=AsyncMock(return_value=[]),
            ),
        ):
            result = await roadmap_service.add_course("user-id", course)

        ensure_exists.assert_awaited_once_with("CS350")
        self.assertEqual(roadmap.save_count, 1)
        self.assertEqual(roadmap.courses[0].course_code, "CS350")
        self.assertEqual(roadmap.courses[0].semester_number, 3)
        self.assertEqual(result.courses[0].course_code, "CS350")

    async def test_add_course_rejects_duplicate_course_in_roadmap(self) -> None:
        roadmap = roadmap_with_courses(
            [CatalogRoadmapCourse(semester_number=3, course_code="CS350")],
        )
        course = TypeAdapter(RoadmapCourseDTO).validate_python(
            {
                "type": "catalog",
                "semester": "3-1",
                "courseCode": "CS350",
            },
        )

        with (
            patch(
                "fastapi_app.services.roadmaps.get_or_create_user_roadmap",
                new=AsyncMock(return_value=roadmap),
            ),
            patch(
                "fastapi_app.services.roadmaps.ensure_catalog_course_exists",
                new=AsyncMock(),
            ),
        ):
            with self.assertRaises(HTTPException) as error:
                await roadmap_service.add_course("user-id", course)

        self.assertEqual(error.exception.status_code, 409)
        self.assertEqual(roadmap.save_count, 0)

    async def test_move_course_changes_semester(self) -> None:
        roadmap = roadmap_with_courses(
            [CatalogRoadmapCourse(semester_number=3, course_code="CS350")],
        )

        with (
            patch(
                "fastapi_app.services.roadmaps.get_or_create_user_roadmap",
                new=AsyncMock(return_value=roadmap),
            ),
            patch(
                "fastapi_app.services.roadmaps.get_prerequisite_warnings",
                new=AsyncMock(return_value=[]),
            ),
        ):
            result = await roadmap_service.move_course("user-id", "cs350", 3, 5)

        self.assertEqual(roadmap.save_count, 1)
        self.assertEqual(roadmap.courses[0].semester_number, 5)
        self.assertEqual(result.courses[0].model_dump(by_alias=True)["semester"], "3-1")

    async def test_update_course_grade_changes_only_grade(self) -> None:
        roadmap = roadmap_with_courses(
            [CatalogRoadmapCourse(semester_number=3, course_code="CS350")],
        )

        with (
            patch(
                "fastapi_app.services.roadmaps.get_or_create_user_roadmap",
                new=AsyncMock(return_value=roadmap),
            ),
            patch(
                "fastapi_app.services.roadmaps.get_prerequisite_warnings",
                new=AsyncMock(return_value=[]),
            ),
        ):
            result = await roadmap_service.update_course_grade(
                "user-id",
                3,
                "CS350",
                "A0",
            )

        self.assertEqual(roadmap.save_count, 1)
        self.assertEqual(roadmap.courses[0].grade, "A0")
        self.assertEqual(result.courses[0].grade, "A0")

    async def test_delete_course_removes_matching_semester_course(self) -> None:
        roadmap = roadmap_with_courses(
            [
                CatalogRoadmapCourse(semester_number=3, course_code="CS350"),
                CatalogRoadmapCourse(semester_number=5, course_code="CS101"),
            ],
        )

        with (
            patch(
                "fastapi_app.services.roadmaps.get_or_create_user_roadmap",
                new=AsyncMock(return_value=roadmap),
            ),
            patch(
                "fastapi_app.services.roadmaps.get_prerequisite_warnings",
                new=AsyncMock(return_value=[]),
            ),
        ):
            result = await roadmap_service.delete_course("user-id", 3, "CS350")

        self.assertEqual(roadmap.save_count, 1)
        self.assertEqual(len(roadmap.courses), 1)
        self.assertEqual(roadmap.courses[0].course_code, "CS101")
        self.assertEqual(result.courses[0].course_code, "CS101")

    async def test_prerequisite_warnings_include_missing_prerequisite(self) -> None:
        roadmap = roadmap_with_courses(
            [CatalogRoadmapCourse(semester_number=3, course_code="CS350")],
        )
        catalog_courses = {
            "CS350": SimpleNamespace(
                course_code="CS350",
                prerequisites=["CS206"],
            ),
        }

        with patch(
            "fastapi_app.services.roadmaps.load_catalog_courses_by_code",
            new=AsyncMock(return_value=catalog_courses),
        ):
            warnings = await roadmap_service.get_prerequisite_warnings(roadmap)

        self.assertEqual(
            [warning.model_dump(by_alias=True) for warning in warnings],
            [{"courseCode": "CS350", "requiredCourseCode": "CS206"}],
        )

    async def test_prerequisite_warnings_include_same_or_later_prerequisite(self) -> None:
        roadmap = roadmap_with_courses(
            [
                CatalogRoadmapCourse(semester_number=3, course_code="CS350"),
                CatalogRoadmapCourse(semester_number=3, course_code="CS206"),
                CatalogRoadmapCourse(semester_number=4, course_code="CS300"),
            ],
        )
        catalog_courses = {
            "CS350": SimpleNamespace(
                course_code="CS350",
                prerequisites=["CS206", "CS300"],
            ),
            "CS206": SimpleNamespace(course_code="CS206", prerequisites=[]),
            "CS300": SimpleNamespace(course_code="CS300", prerequisites=[]),
        }

        with patch(
            "fastapi_app.services.roadmaps.load_catalog_courses_by_code",
            new=AsyncMock(return_value=catalog_courses),
        ):
            warnings = await roadmap_service.get_prerequisite_warnings(roadmap)

        self.assertEqual(
            [warning.model_dump(by_alias=True) for warning in warnings],
            [
                {"courseCode": "CS350", "requiredCourseCode": "CS206"},
                {"courseCode": "CS350", "requiredCourseCode": "CS300"},
            ],
        )

    async def test_prerequisite_warnings_ignore_prior_prerequisite(self) -> None:
        roadmap = roadmap_with_courses(
            [
                CatalogRoadmapCourse(semester_number=2, course_code="CS206"),
                CatalogRoadmapCourse(semester_number=3, course_code="CS350"),
            ],
        )
        catalog_courses = {
            "CS206": SimpleNamespace(course_code="CS206", prerequisites=[]),
            "CS350": SimpleNamespace(
                course_code="CS350",
                prerequisites=["CS206"],
            ),
        }

        with patch(
            "fastapi_app.services.roadmaps.load_catalog_courses_by_code",
            new=AsyncMock(return_value=catalog_courses),
        ):
            warnings = await roadmap_service.get_prerequisite_warnings(roadmap)

        self.assertEqual(warnings, [])


def integration_tests_enabled() -> bool:
    return os.getenv("RUN_INTEGRATION_TESTS") == "1"


async def clear_roadmap_integration_collections() -> None:
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
        category="전공필수",
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
    "set RUN_INTEGRATION_TESTS=1 to run roadmap API integration tests",
)
class RoadmapApiIntegrationTest(unittest.TestCase):
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
        cls.client.portal.call(clear_roadmap_integration_collections)
        cls.client.__exit__(None, None, None)

    def setUp(self) -> None:
        self.client.portal.call(clear_roadmap_integration_collections)
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

    def test_roadmap_course_crud_flow(self) -> None:
        get_response = self.client.get("/roadmap/me", headers=self.headers)

        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.json()["currentSemester"], "1-1")
        self.assertEqual(get_response.json()["courses"], [])

        current_response = self.client.patch(
            "/roadmap/me/current-semester",
            params={"semester": "2-1"},
            headers=self.headers,
        )

        self.assertEqual(current_response.status_code, 200)
        self.assertEqual(current_response.json()["currentSemester"], "2-1")

        add_response = self.client.post(
            "/roadmap/me/courses",
            json={
                "type": "catalog",
                "semester": "2-1",
                "courseCode": "cs350",
            },
            headers=self.headers,
        )

        self.assertEqual(add_response.status_code, 200)
        self.assertEqual(
            add_response.json()["courses"],
            [
                {
                    "type": "catalog",
                    "semester": "2-1",
                    "courseCode": "CS350",
                    "grade": "PLANNED",
                },
            ],
        )

        duplicate_response = self.client.post(
            "/roadmap/me/courses",
            json={
                "type": "catalog",
                "semester": "2-1",
                "courseCode": "CS350",
            },
            headers=self.headers,
        )

        self.assertEqual(duplicate_response.status_code, 409)

        duplicate_other_semester_response = self.client.post(
            "/roadmap/me/courses",
            json={
                "type": "catalog",
                "semester": "3-1",
                "courseCode": "CS350",
            },
            headers=self.headers,
        )

        self.assertEqual(duplicate_other_semester_response.status_code, 409)

        move_response = self.client.post(
            "/roadmap/me/courses/move",
            params={
                "courseCode": "CS350",
                "fromSemester": "2-1",
                "toSemester": "2-2",
            },
            headers=self.headers,
        )

        self.assertEqual(move_response.status_code, 200)
        self.assertEqual(
            [course["semester"] for course in move_response.json()["courses"]],
            ["2-2", "3-1"],
        )

        grade_response = self.client.patch(
            "/roadmap/me/courses/2-2/CS350/grade",
            params={"grade": "A0"},
            headers=self.headers,
        )

        self.assertEqual(grade_response.status_code, 200)
        self.assertEqual(grade_response.json()["courses"][0]["grade"], "A0")

        delete_response = self.client.delete(
            "/roadmap/me/courses/2-2/CS350",
            headers=self.headers,
        )

        self.assertEqual(delete_response.status_code, 200)
        self.assertEqual(delete_response.json()["courses"], [])

    def test_roadmap_rejects_unknown_catalog_course(self) -> None:
        response = self.client.post(
            "/roadmap/me/courses",
            json={
                "type": "catalog",
                "semester": "1-1",
                "courseCode": "CS999",
            },
            headers=self.headers,
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Course not found")


if __name__ == "__main__":
    unittest.main()
