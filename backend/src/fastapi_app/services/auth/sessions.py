from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status

from db.models.auth_session import AuthSession
from fastapi_app.services.auth.security import (
    create_session_token,
    get_session_idle_timeout_minutes,
    hash_session_token,
)


def get_next_expiration(now: datetime) -> datetime:
    return now + timedelta(minutes=get_session_idle_timeout_minutes())


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


async def start_session(user_id: str) -> tuple[str, AuthSession]:
    now = datetime.now(UTC)
    token = create_session_token()
    session = AuthSession(
        user_id=user_id,
        token_hash=hash_session_token(token),
        is_active=True,
        expires_at=get_next_expiration(now),
        last_used_at=now,
    )
    await session.insert()
    return token, session


async def validate_session(token: str) -> AuthSession:
    session = await AuthSession.find_one(
        AuthSession.token_hash == hash_session_token(token),
        AuthSession.is_active == True,  # noqa: E712
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token",
        )

    now = datetime.now(UTC)
    if ensure_utc(session.expires_at) <= now:
        session.is_active = False
        session.ended_at = now
        await session.replace()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    session.last_used_at = now
    session.expires_at = get_next_expiration(now)
    await session.replace()
    return session


async def end_session(session: AuthSession) -> None:
    session.is_active = False
    session.ended_at = datetime.now(UTC)
    await session.replace()
