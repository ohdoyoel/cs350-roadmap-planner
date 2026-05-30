from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from db.models.user_settings import AcademicOption, Language, Theme


class SettingsDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    user_id: str = Field(serialization_alias="userId")
    theme: Theme
    language: Language
    academic_option: AcademicOption = Field(serialization_alias="academicOption")
    graduation_year: int | None = Field(serialization_alias="graduationYear")


class UserDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str | None = None
    kaist_email: str = Field(serialization_alias="kaistEmail")
    email_verified: bool = Field(serialization_alias="emailVerified")
    email_verified_at: datetime | None = Field(serialization_alias="emailVerifiedAt")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class UserWithSettingsDTO(UserDTO):
    settings: SettingsDTO
