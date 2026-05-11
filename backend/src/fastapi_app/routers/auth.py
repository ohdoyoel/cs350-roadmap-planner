from fastapi import APIRouter, Depends, status

from db.models.auth_session import AuthSession
from fastapi_app.dependencies import get_current_session
from fastapi_app.schemas.auth import LoginRequest, SessionResponse, SignupRequest
from fastapi_app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SessionResponse)
async def signup(payload: SignupRequest) -> SessionResponse:
    return await auth_service.signup(payload)


@router.post("/login", response_model=SessionResponse)
async def login(payload: LoginRequest) -> SessionResponse:
    return await auth_service.login(payload)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    session: AuthSession = Depends(get_current_session),
) -> None:
    await auth_service.logout(session)
