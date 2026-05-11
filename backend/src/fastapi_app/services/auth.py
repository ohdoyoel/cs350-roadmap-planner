from db.models.auth_session import AuthSession
from fastapi import HTTPException, status

from fastapi_app.schemas.auth import LoginRequest, SessionResponse, SignupRequest
from fastapi_app.services.auth_sessions import end_session, start_session
from fastapi_app.services.settings import create_user_settings
from fastapi_app.services.users import (
    create_user,
    get_user_by_email,
    serialize_user,
)


async def create_session_response(user_id: str, user) -> SessionResponse:
    session_token, session = await start_session(user_id)
    return SessionResponse(
        session_token=session_token,
        expires_at=session.expires_at,
        user=serialize_user(user),
    )


async def signup(payload: SignupRequest) -> SessionResponse:
    user = await create_user(email=payload.email, name=payload.name)
    await create_user_settings(
        user_id=str(user.id),
        graduation_year=payload.graduation_year,
    )
    return await create_session_response(str(user.id), user)


async def login(payload: LoginRequest) -> SessionResponse:
    user = await get_user_by_email(payload.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return await create_session_response(str(user.id), user)


async def logout(session: AuthSession) -> None:
    await end_session(session)
