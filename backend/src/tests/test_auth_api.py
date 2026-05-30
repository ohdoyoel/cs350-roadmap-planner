import os
import unittest
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch

from db.client import load_dotenv

load_dotenv()

from fastapi.testclient import TestClient

from db.models.auth_session import AuthSession
from db.models.email_verification import EmailVerification
from db.models.roadmap import Roadmap
from db.models.user import User
from db.models.user_settings import UserSettings
from fastapi_app.main import app
from fastapi_app.services.auth.security import hash_session_token


def integration_tests_enabled() -> bool:
    return os.getenv("RUN_INTEGRATION_TESTS") == "1"


async def clear_auth_collections() -> None:
    await AuthSession.delete_all()
    await EmailVerification.delete_all()
    await Roadmap.delete_all()
    await UserSettings.delete_all()
    await User.delete_all()


@unittest.skipUnless(
    integration_tests_enabled(),
    "set RUN_INTEGRATION_TESTS=1 to run auth API integration tests",
)
class AuthApiIntegrationTest(unittest.TestCase):
    client: TestClient
    mail_patcher = None

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
        cls.mail_patcher = patch(
            "fastapi_app.services.auth.email_verification.send_verification_email",
            new_callable=AsyncMock,
        )
        cls.mail_patcher.start()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client.portal.call(clear_auth_collections)
        cls.client.__exit__(None, None, None)
        if cls.mail_patcher is not None:
            cls.mail_patcher.stop()

    def setUp(self) -> None:
        self.client.portal.call(clear_auth_collections)

    def verify_user_email(self, email: str = "student@kaist.ac.kr") -> None:
        async def verify_user() -> None:
            user = await User.find_one(User.kaist_email == email)
            assert user is not None
            user.email_verified = True
            user.email_verified_at = datetime.now(UTC)
            await user.save()

        self.client.portal.call(verify_user)

    def signup_verify_and_login(self) -> str:
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )
        self.assertEqual(signup_response.status_code, 200)
        self.verify_user_email()
        login_response = self.client.post(
            "/auth/login",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )
        self.assertEqual(login_response.status_code, 200)
        return login_response.json()["sessionToken"]

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
        self.assertEqual(body["kaistEmail"], "student@kaist.ac.kr")
        self.assertTrue(body["emailSent"])

        self.verify_user_email()
        login_response = self.client.post(
            "/auth/login",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json()["sessionToken"]

        me_response = self.client.get(
            "/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(me_response.status_code, 200)
        me_body = me_response.json()
        self.assertEqual(me_body["kaistEmail"], "student@kaist.ac.kr")
        self.assertTrue(me_body["emailVerified"])
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

    def test_login_rejects_unverified_user(self) -> None:
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
        self.assertEqual(login_response.status_code, 403)
        self.assertEqual(login_response.json()["detail"], "Email is not verified")

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
        token = self.signup_verify_and_login()

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

    def test_delete_me_removes_account_and_allows_signup_again(self) -> None:
        token = self.signup_verify_and_login()

        delete_response = self.client.delete(
            "/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        me_response = self.client.get(
            "/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        signup_again_response = self.client.post(
            "/auth/signup",
            json={
                "email": "student@kaist.ac.kr",
                "password": "secure-password",
            },
        )

        self.assertEqual(delete_response.status_code, 204)
        self.assertEqual(me_response.status_code, 401)
        self.assertEqual(signup_again_response.status_code, 200)
        self.assertTrue(signup_again_response.json()["emailSent"])

    def test_expired_session_is_marked_inactive(self) -> None:
        token = self.signup_verify_and_login()

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
