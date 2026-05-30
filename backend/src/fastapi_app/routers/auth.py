from html import escape

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import HTMLResponse

from db.models.auth_session import AuthSession
from fastapi_app.dependencies import get_current_session
from fastapi_app.schemas.auth import (
    LoginRequest,
    ResendVerificationRequest,
    SessionResponse,
    SignupRequest,
    SignupResponse,
)
from fastapi_app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse)
async def signup(payload: SignupRequest) -> SignupResponse:
    return await auth_service.signup(payload)


@router.post("/login", response_model=SessionResponse)
async def login(payload: LoginRequest) -> SessionResponse:
    return await auth_service.login(payload)


@router.post("/resend-verification", response_model=SignupResponse)
async def resend_verification(
    payload: ResendVerificationRequest,
) -> SignupResponse:
    return await auth_service.resend_verification(payload)


@router.get("/verify-email", response_class=HTMLResponse)
async def verify_email(token: str = Query(min_length=1)) -> HTMLResponse:
    try:
        await auth_service.verify_email(token)
    except HTTPException as exc:
        detail = escape(str(exc.detail))
        return HTMLResponse(
            status_code=getattr(exc, "status_code", 400),
            content=f"""
            <!doctype html>
            <html lang="ko">
              <head><meta charset="utf-8"><title>Email verification failed</title></head>
              <body>
                <h1>이메일 인증에 실패했습니다.</h1>
                <p>{detail}</p>
              </body>
            </html>
            """,
        )
    return HTMLResponse(
        content="""
        <!doctype html>
        <html lang="ko">
          <head><meta charset="utf-8"><title>Email verified</title></head>
          <body>
            <h1>이메일 인증이 완료되었습니다.</h1>
            <p>앱으로 돌아가 다시 로그인하세요.</p>
          </body>
        </html>
        """,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    session: AuthSession = Depends(get_current_session),
) -> None:
    await auth_service.logout(session)
