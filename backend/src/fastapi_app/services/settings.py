from datetime import UTC, datetime

from fastapi import HTTPException, status

from db.models.user_settings import UserSettings
from fastapi_app.schemas.users import AcademicOptionUpdateRequest, SettingsDTO


def serialize_settings(settings: UserSettings) -> SettingsDTO:
    return SettingsDTO(
        id=str(settings.id),
        user_id=settings.user_id,
        theme=settings.theme,
        language=settings.language,
        academic_option=settings.academic_option,
        graduation_year=settings.graduation_year,
    )


async def create_user_settings(
    user_id: str,
    graduation_year: int | None = None,
) -> UserSettings:
    existing_settings = await get_user_settings(user_id)
    if existing_settings is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Settings already exists",
        )

    settings = UserSettings(user_id=user_id, graduation_year=graduation_year)
    await settings.insert()
    return settings


async def get_user_settings(user_id: str) -> UserSettings | None:
    return await UserSettings.find_one(UserSettings.user_id == user_id)


async def update_user_academic_option(
    user_id: str,
    payload: AcademicOptionUpdateRequest,
) -> SettingsDTO:
    settings = await get_user_settings(user_id)
    if settings is None:
        raise HTTPException(status_code=404, detail="Settings not found")

    settings.academic_option = payload.academic_option
    settings.updated_at = datetime.now(UTC)
    await settings.save()
    return serialize_settings(settings)
