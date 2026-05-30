from db.models.auth_session import AuthSession
from fastapi import HTTPException, status

from fastapi_app.schemas.auth import (
    LoginRequest,
    ResendVerificationRequest,
    SessionResponse,
    SignupRequest,
    SignupResponse,
)
from fastapi_app.services.auth.email_verification import (
    create_and_send_email_verification,
    verify_email_token,
)
from fastapi_app.services.auth.security import verify_password
from fastapi_app.services.auth.sessions import end_session, start_session
from fastapi_app.services.settings import create_user_settings
from fastapi_app.services.users import (
    create_user,
    delete_user_account,
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


async def signup(payload: SignupRequest) -> SignupResponse:
    user = await create_user(
        email=payload.email,
        password=payload.password,
        name=payload.name,
    )
    try:
        await create_user_settings(
            user_id=str(user.id),
            graduation_year=payload.graduation_year,
        )
        await create_and_send_email_verification(user)
    except Exception:
        await delete_user_account(user)
        raise
    return SignupResponse(
        kaist_email=user.kaist_email,
        email_sent=True,
        message="Verification email sent",
    )


async def login(payload: LoginRequest) -> SessionResponse:
    user = await get_user_by_email(payload.email)
    if user is None or user.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email is not verified",
        )

    return await create_session_response(str(user.id), user)


async def logout(session: AuthSession) -> None:
    await end_session(session)


async def verify_email(token: str) -> None:
    await verify_email_token(token)


async def resend_verification(payload: ResendVerificationRequest) -> SignupResponse:
    user = await get_user_by_email(payload.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already verified",
        )

    await create_and_send_email_verification(user)
    return SignupResponse(
        kaist_email=user.kaist_email,
        email_sent=True,
        message="Verification email sent",
    )
