from datetime import UTC, datetime

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from db.models.user import User
from db.models.user_settings import UserSettings
from fastapi_app.schemas.users import UserDTO, UserWithSettingsDTO
from fastapi_app.services.settings import serialize_settings


def serialize_user(user: User) -> UserDTO:
    return UserDTO(
        id=str(user.id),
        name=user.name,
        kaist_email=user.kaist_email,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


def serialize_user_with_settings(
    user: User,
    settings: UserSettings,
) -> UserWithSettingsDTO:
    return UserWithSettingsDTO(
        **serialize_user(user).model_dump(),
        settings=serialize_settings(settings),
    )


async def get_user_by_id(user_id: str) -> User | None:
    try:
        object_id = PydanticObjectId(user_id)
    except ValueError:
        return None
    return await User.get(object_id)


async def get_user_by_email(email: str) -> User | None:
    return await User.find_one(User.kaist_email == email.strip().lower())


async def create_user(
    email: str,
    name: str | None = None,
) -> User:
    normalized_email = email.strip().lower()
    existing_user = await get_user_by_email(normalized_email)
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists",
        )

    now = datetime.now(UTC)
    user = User(
        kaist_email=normalized_email,
        name=name,
        updated_at=now,
    )
    await user.insert()
    return user
