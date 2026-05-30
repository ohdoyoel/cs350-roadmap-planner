import os
import unittest

from db.client import load_dotenv
from fastapi_app.services.auth.email_verification import send_verification_email

load_dotenv()


def smtp_email_test_enabled() -> bool:
    return os.getenv("RUN_SMTP_EMAIL_TEST") == "1"


def smtp_test_recipient() -> str | None:
    recipient = os.getenv("SMTP_TEST_RECIPIENT")
    if recipient is None or recipient.strip() == "":
        return None
    return recipient.strip()


@unittest.skipUnless(
    smtp_email_test_enabled(),
    "set RUN_SMTP_EMAIL_TEST=1 and SMTP_TEST_RECIPIENT to send a real email",
)
class EmailVerificationSmtpTest(unittest.IsolatedAsyncioTestCase):
    async def test_send_verification_email_through_configured_smtp(self) -> None:
        recipient = smtp_test_recipient()
        if recipient is None:
            self.skipTest("missing SMTP_TEST_RECIPIENT")

        await send_verification_email(
            recipient,
            "http://localhost:8000/auth/verify-email?token=smtp-test-token",
        )


if __name__ == "__main__":
    unittest.main()
