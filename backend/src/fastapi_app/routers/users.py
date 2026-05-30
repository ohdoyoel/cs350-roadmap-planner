from fastapi import APIRouter, Depends, HTTPException, status

from db.models.user import User
from fastapi_app.dependencies import get_current_user
from fastapi_app.schemas.users import UserWithSettingsDTO
from fastapi_app.services.settings import get_user_settings
from fastapi_app.services.users import delete_user_account, serialize_user_with_settings

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserWithSettingsDTO)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserWithSettingsDTO:
    settings = await get_user_settings(str(current_user.id))
    if settings is None:
        raise HTTPException(status_code=404, detail="Settings not found")
    return serialize_user_with_settings(current_user, settings)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    current_user: User = Depends(get_current_user),
) -> None:
    await delete_user_account(current_user)
