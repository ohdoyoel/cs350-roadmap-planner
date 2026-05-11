from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from db.models.auth_session import AuthSession
from db.models.user import User
from fastapi_app.services.auth_sessions import validate_session
from fastapi_app.services.users import get_user_by_id

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthSession:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    return await validate_session(credentials.credentials)


async def get_current_user(
    session: AuthSession = Depends(get_current_session),
) -> User:
    user = await get_user_by_id(session.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token",
        )
    return user
