from fastapi import APIRouter

from fastapi_app.schemas.examples import ExampleCreate, ExampleDTO
from fastapi_app.services import examples as example_service

router = APIRouter(prefix="/examples", tags=["examples"])


@router.post("", response_model=ExampleDTO)
async def create_example(payload: ExampleCreate) -> ExampleDTO:
    return await example_service.create_example(payload.name)


@router.get("", response_model=list[ExampleDTO])
async def list_examples() -> list[ExampleDTO]:
    return await example_service.list_examples()

