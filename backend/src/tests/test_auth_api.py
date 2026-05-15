import os
import unittest
from datetime import UTC, datetime, timedelta

from db.client import load_dotenv

load_dotenv()

from fastapi.testclient import TestClient

from db.models.auth_session import AuthSession
from db.models.user import User
from db.models.user_settings import UserSettings
from fastapi_app.main import app
from fastapi_app.services.auth.security import hash_session_token


def integration_tests_enabled() -> bool:
    return os.getenv("RUN_INTEGRATION_TESTS") == "1"


async def clear_auth_collections() -> None:
    await AuthSession.delete_all()
    await UserSettings.delete_all()
    await User.delete_all()


@unittest.skipUnless(
    integration_tests_enabled(),
    "set RUN_INTEGRATION_TESTS=1 to run auth API integration tests",
)
class AuthApiIntegrationTest(unittest.TestCase):
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
        cls.client.portal.call(clear_auth_collections)
        cls.client.__exit__(None, None, None)

    def setUp(self) -> None:
        self.client.portal.call(clear_auth_collections)

    def test_signup_returns_session_and_me(self) -> None:
        response = self.client.post(
            "/auth/signup",
            json={
                "email": "  Student@KAIST.AC.KR  ",
                "password": "secure-password",
                "name": "  Student  ",
                "graduationYear": 2027,
            },
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["tokenType"], "bearer")
        self.assertEqual(body["user"]["kaistEmail"], "student@kaist.ac.kr")
        self.assertEqual(body["user"]["name"], "Student")
        self.assertIn("sessionToken", body)

        me_response = self.client.get(
            "/me",
            headers={"Authorization": f"Bearer {body['sessionToken']}"},
        )

        self.assertEqual(me_response.status_code, 200)
        me_body = me_response.json()
        self.assertEqual(me_body["kaistEmail"], "student@kaist.ac.kr")
        self.assertEqual(me_body["settings"]["graduationYear"], 2027)
        self.assertEqual(me_body["settings"]["theme"], "system")

    def test_signup_rejects_duplicate_email(self) -> None:
        payload = {
            "email": "student@kaist.ac.kr",
            "password": "secure-password",
        }

        first_response = self.client.post("/auth/signup", json=payload)
        second_response = self.client.post("/auth/signup", json=payload)

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 409)
        self.assertEqual(second_response.json()["detail"], "User already exists")

    def test_login_returns_new_session_for_existing_user(self) -> None:
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )
        login_response = self.client.post(
            "/auth/login",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )

        self.assertEqual(signup_response.status_code, 200)
        self.assertEqual(login_response.status_code, 200)
        self.assertNotEqual(
            signup_response.json()["sessionToken"],
            login_response.json()["sessionToken"],
        )
        self.assertEqual(
            login_response.json()["user"]["kaistEmail"],
            "student@kaist.ac.kr",
        )

    def test_login_rejects_wrong_password(self) -> None:
        self.client.post(
            "/auth/signup",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )

        response = self.client.post(
            "/auth/login",
            json={
                "email": "student@kaist.ac.kr",
                "password": "wrong-password",
            },
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid email or password")

    def test_me_rejects_missing_and_invalid_token(self) -> None:
        missing_response = self.client.get("/me")
        invalid_response = self.client.get(
            "/me",
            headers={"Authorization": "Bearer invalid-token"},
        )

        self.assertEqual(missing_response.status_code, 401)
        self.assertEqual(missing_response.json()["detail"], "Missing bearer token")
        self.assertEqual(invalid_response.status_code, 401)
        self.assertEqual(invalid_response.json()["detail"], "Invalid session token")

    def test_logout_invalidates_session_token(self) -> None:
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )
        token = signup_response.json()["sessionToken"]

        logout_response = self.client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        me_response = self.client.get(
            "/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(logout_response.status_code, 204)
        self.assertEqual(me_response.status_code, 401)
        self.assertEqual(me_response.json()["detail"], "Invalid session token")

    def test_expired_session_is_marked_inactive(self) -> None:
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )
        token = signup_response.json()["sessionToken"]

        async def expire_session() -> None:
            session = await AuthSession.find_one(
                AuthSession.token_hash == hash_session_token(token),
            )
            assert session is not None
            session.expires_at = datetime.now(UTC) - timedelta(minutes=1)
            await session.replace()

        self.client.portal.call(expire_session)

        response = self.client.get(
            "/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Session expired")

        async def get_session() -> AuthSession | None:
            return await AuthSession.find_one(
                AuthSession.token_hash == hash_session_token(token),
            )

        session = self.client.portal.call(get_session)
        self.assertIsNotNone(session)
        assert session is not None
        self.assertFalse(session.is_active)
        self.assertIsNotNone(session.ended_at)


if __name__ == "__main__":
    unittest.main()
