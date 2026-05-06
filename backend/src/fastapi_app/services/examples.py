from db.models.example import Example
from fastapi_app.schemas.examples import ExampleDTO


def serialize_example(example: Example) -> ExampleDTO:
    return ExampleDTO(
        id=str(example.id),
        name=example.name,
        created_at=example.created_at,
    )


async def create_example(name: str) -> ExampleDTO:
    example = Example(name=name)
    await example.insert()
    return serialize_example(example)


async def list_examples() -> list[ExampleDTO]:
    examples = await Example.find_all().to_list()
    return [serialize_example(example) for example in examples]
