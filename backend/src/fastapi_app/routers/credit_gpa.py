from fastapi import APIRouter, Depends

from db.models.user import User
from fastapi_app.dependencies import get_current_user
from fastapi_app.schemas.credit_gpa import CreditGPADTO
from fastapi_app.services import credit_gpa as credit_gpa_service

router = APIRouter(prefix="/credit-gpa", tags=["credit-gpa"])


@router.get("/me", response_model=CreditGPADTO)
async def get_my_credit_gpa(
    current_user: User = Depends(get_current_user),
) -> CreditGPADTO:
    return await credit_gpa_service.get_my_credit_gpa(str(current_user.id))
