import asyncio
import os
import smtplib
from datetime import UTC, datetime, timedelta
from email.message import EmailMessage
from urllib.parse import urlencode

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from db.client import load_dotenv
from db.models.email_verification import EmailVerification
from db.models.user import User
from fastapi_app.services.auth.security import (
    create_email_verification_token,
    hash_email_verification_token,
)

EMAIL_VERIFICATION_TTL_MINUTES = 60


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def get_email_verification_base_url() -> str:
    load_dotenv()
    return os.getenv("EMAIL_VERIFICATION_BASE_URL", "http://localhost:8000").rstrip("/")


def build_verification_url(token: str) -> str:
    query = urlencode({"token": token})
    return f"{get_email_verification_base_url()}/auth/verify-email?{query}"


def get_required_email_env(name: str) -> str:
    load_dotenv()
    value = os.getenv(name)
    if value is None or value == "":
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def build_verification_email_text(verification_url: str) -> str:
    return "\n".join(
        [
            "Roadmap Planner email verification link:",
            "",
            verification_url,
            "",
            f"This link expires in {EMAIL_VERIFICATION_TTL_MINUTES} minutes.",
        ],
    )


def build_verification_message(
    from_email: str,
    to_email: str,
    verification_url: str,
) -> EmailMessage:
    message = EmailMessage()
    message["Subject"] = "Roadmap Planner email verification"
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(build_verification_email_text(verification_url))
    return message


def send_verification_email_sync(to_email: str, verification_url: str) -> None:
    load_dotenv()
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "465"))
    username = get_required_email_env("SMTP_USERNAME").strip()
    password = get_required_email_env("SMTP_PASSWORD").replace(" ", "")
    from_email = os.getenv("SMTP_FROM_EMAIL") or username
    timeout_seconds = int(os.getenv("SMTP_TIMEOUT_SECONDS", "30"))
    use_ssl = os.getenv("SMTP_USE_SSL", "true").casefold() != "false"
    use_tls = os.getenv("SMTP_USE_TLS", "false").casefold() == "true"

    message = build_verification_message(from_email, to_email, verification_url)
    smtp_class = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP

    try:
        with smtp_class(host, port, timeout=timeout_seconds) as smtp:
            smtp.ehlo()
            if use_tls and not use_ssl:
                smtp.starttls()
                smtp.ehlo()
            smtp.login(username, password)
            smtp.send_message(message)
    except smtplib.SMTPException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"SMTP email delivery failed: {exc}",
        ) from exc
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"SMTP connection failed: {exc}",
        ) from exc


async def send_verification_email(to_email: str, verification_url: str) -> None:
    await asyncio.to_thread(send_verification_email_sync, to_email, verification_url)


async def create_and_send_email_verification(user: User) -> None:
    token = create_email_verification_token()
    now = datetime.now(UTC)
    verification = EmailVerification(
        user_id=str(user.id),
        email=user.kaist_email,
        token_hash=hash_email_verification_token(token),
        expires_at=now + timedelta(minutes=EMAIL_VERIFICATION_TTL_MINUTES),
        created_at=now,
    )
    await verification.insert()
    await send_verification_email(user.kaist_email, build_verification_url(token))


async def verify_email_token(token: str) -> None:
    token_hash = hash_email_verification_token(token)
    verification = await EmailVerification.find_one(
        EmailVerification.token_hash == token_hash,
    )
    if verification is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token",
        )
    if verification.used_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token already used",
        )
    if ensure_utc(verification.expires_at) <= datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token expired",
        )

    user = await User.get(PydanticObjectId(verification.user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    now = datetime.now(UTC)
    user.email_verified = True
    user.email_verified_at = now
    user.updated_at = now
    verification.used_at = now
    await user.save()
    await verification.save()
