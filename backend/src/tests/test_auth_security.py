import os
import unittest
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import patch

from fastapi_app.schemas.auth import LoginRequest, SignupRequest
from fastapi_app.security import (
    create_session_token,
    get_session_idle_timeout_minutes,
    hash_password,
    hash_session_token,
    verify_password,
)
from fastapi_app.services.settings import serialize_settings
from fastapi_app.services.users import serialize_user, serialize_user_with_settings


class LoginSchemaTest(unittest.TestCase):
    def test_login_accepts_kaist_email_and_normalizes(self) -> None:
        payload = LoginRequest(
            email="  Student@KAIST.AC.KR  ",
            password="secure-password",
        )

        self.assertEqual(payload.email, "student@kaist.ac.kr")

    def test_login_rejects_non_kaist_email(self) -> None:
        with self.assertRaises(ValueError):
            LoginRequest(email="student@example.com", password="secure-password")

    def test_login_rejects_short_password(self) -> None:
        with self.assertRaises(ValueError):
            LoginRequest(email="student@kaist.ac.kr", password="short")


class SignupSchemaTest(unittest.TestCase):
    def test_signup_accepts_profile_fields_and_normalizes(self) -> None:
        payload = SignupRequest(
            email="  Student@KAIST.AC.KR  ",
            password="secure-password",
            name="  Kim  ",
            graduationYear=2027,
        )

        self.assertEqual(payload.email, "student@kaist.ac.kr")
        self.assertEqual(payload.password, "secure-password")
        self.assertEqual(payload.name, "Kim")
        self.assertEqual(payload.graduation_year, 2027)

    def test_signup_rejects_non_kaist_email(self) -> None:
        with self.assertRaises(ValueError):
            SignupRequest(email="student@example.com", password="secure-password")

    def test_signup_rejects_password_with_edge_whitespace(self) -> None:
        with self.assertRaises(ValueError):
            SignupRequest(email="student@kaist.ac.kr", password=" secure-password ")


class SessionSecurityTest(unittest.TestCase):
    def test_create_session_token_returns_random_values(self) -> None:
        first = create_session_token()
        second = create_session_token()

        self.assertNotEqual(first, second)
        self.assertGreaterEqual(len(first), 32)

    def test_hash_session_token_is_stable_and_hides_raw_token(self) -> None:
        token = "session-token"
        hashed = hash_session_token(token)

        self.assertEqual(hashed, hash_session_token(token))
        self.assertNotEqual(hashed, token)

    def test_idle_timeout_defaults_to_one_hour(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(get_session_idle_timeout_minutes(), 60)

    def test_idle_timeout_reads_environment(self) -> None:
        with patch.dict(os.environ, {"SESSION_IDLE_TIMEOUT_MINUTES": "30"}):
            self.assertEqual(get_session_idle_timeout_minutes(), 30)


class PasswordSecurityTest(unittest.TestCase):
    def test_password_hash_uses_salt_and_hides_plaintext(self) -> None:
        with patch.dict(os.environ, {"PASSWORD_PEPPER": "test-pepper"}):
            first = hash_password("secure-password")
            second = hash_password("secure-password")

        self.assertNotEqual(first, second)
        self.assertNotIn("secure-password", first)
        self.assertTrue(first.startswith("pbkdf2_sha256$"))

    def test_verify_password_accepts_matching_password_and_pepper(self) -> None:
        with patch.dict(os.environ, {"PASSWORD_PEPPER": "test-pepper"}):
            stored_hash = hash_password("secure-password")
            self.assertTrue(verify_password("secure-password", stored_hash))
            self.assertFalse(verify_password("wrong-password", stored_hash))

    def test_verify_password_rejects_different_pepper(self) -> None:
        with patch.dict(os.environ, {"PASSWORD_PEPPER": "first-pepper"}):
            stored_hash = hash_password("secure-password")

        with patch.dict(os.environ, {"PASSWORD_PEPPER": "second-pepper"}):
            self.assertFalse(verify_password("secure-password", stored_hash))


class UserSerializationTest(unittest.TestCase):
    def test_user_dto_serializes_camel_case(self) -> None:
        now = datetime.now(UTC)
        user = SimpleNamespace(
            id="507f1f77bcf86cd799439011",
            kaist_email="student@kaist.ac.kr",
            name="Student",
            created_at=now,
            updated_at=now,
        )

        dumped = serialize_user(user).model_dump(by_alias=True)

        self.assertIn("kaistEmail", dumped)
        self.assertIn("createdAt", dumped)
        self.assertIn("updatedAt", dumped)
        self.assertNotIn("kaist_email", dumped)

    def test_user_with_settings_serializes_appendix_shape(self) -> None:
        now = datetime.now(UTC)
        user = SimpleNamespace(
            id="507f1f77bcf86cd799439011",
            kaist_email="student@kaist.ac.kr",
            name="Student",
            created_at=now,
            updated_at=now,
        )
        settings = SimpleNamespace(
            id="607f1f77bcf86cd799439011",
            user_id="507f1f77bcf86cd799439011",
            theme="system",
            language="ko",
            academic_option="major",
            graduation_year=2027,
        )

        dumped = serialize_user_with_settings(user, settings).model_dump(by_alias=True)

        self.assertEqual(dumped["kaistEmail"], "student@kaist.ac.kr")
        self.assertEqual(dumped["settings"]["academicOption"], "major")
        self.assertEqual(dumped["settings"]["graduationYear"], 2027)
        self.assertNotIn("academic_option", dumped["settings"])

    def test_settings_dto_serializes_camel_case(self) -> None:
        settings = SimpleNamespace(
            id="607f1f77bcf86cd799439011",
            user_id="507f1f77bcf86cd799439011",
            theme="dark",
            language="en",
            academic_option="minor",
            graduation_year=2026,
        )

        dumped = serialize_settings(settings).model_dump(by_alias=True)

        self.assertIn("userId", dumped)
        self.assertIn("academicOption", dumped)
        self.assertIn("graduationYear", dumped)


if __name__ == "__main__":
    unittest.main()
