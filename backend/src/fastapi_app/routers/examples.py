from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from db.models.example import Example

router = APIRouter(prefix="/examples", tags=["examples"])


class ExampleCreate(BaseModel):
    name: str


class ExampleRead(BaseModel):
    id: str
    name: str
    created_at: datetime


def serialize_example(example: Example) -> ExampleRead:
    return ExampleRead(
        id=str(example.id),
        name=example.name,
        created_at=example.created_at,
    )


@router.post("", response_model=ExampleRead)
async def create_example(payload: ExampleCreate) -> ExampleRead:
    example = Example(name=payload.name)
    await example.insert()
    return serialize_example(example)


@router.get("", response_model=list[ExampleRead])
async def list_examples() -> list[ExampleRead]:
    examples = await Example.find_all().to_list()
    return [serialize_example(example) for example in examples]

