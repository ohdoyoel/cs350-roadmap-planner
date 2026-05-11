from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from fastapi_app.schemas.users import UserDTO


class LoginRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: str

    @field_validator("email")
    @classmethod
    def validate_kaist_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized.endswith("@kaist.ac.kr"):
            raise ValueError("KAIST email is required")
        return normalized


class SignupRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: str
    name: str | None = None
    graduation_year: int | None = Field(
        default=None,
        validation_alias="graduationYear",
        serialization_alias="graduationYear",
    )

    @field_validator("email")
    @classmethod
    def validate_kaist_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized.endswith("@kaist.ac.kr"):
            raise ValueError("KAIST email is required")
        return normalized

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class SessionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    session_token: str = Field(serialization_alias="sessionToken")
    token_type: str = Field(default="bearer", serialization_alias="tokenType")
    expires_at: datetime = Field(serialization_alias="expiresAt")
    user: UserDTO
