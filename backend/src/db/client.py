import os
from pathlib import Path

from beanie import init_beanie
from pymongo import AsyncMongoClient

from db.models.course import Course
from db.models.example import Example

_client: AsyncMongoClient | None = None


def load_dotenv() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if value is None or value == "":
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def get_mongodb_uri() -> str:
    load_dotenv()
    return get_required_env("MONGODB_URI")


def get_mongodb_database() -> str:
    load_dotenv()
    return get_required_env("MONGODB_DATABASE")


async def init_database() -> None:
    global _client

    _client = AsyncMongoClient(get_mongodb_uri())
    await init_beanie(
        database=_client[get_mongodb_database()],
        document_models=[Course, Example],
    )


async def close_database() -> None:
    global _client

    if _client is not None:
        await _client.close()
        _client = None


async def ping_database() -> dict[str, float]:
    if _client is None:
        raise RuntimeError("Database client is not initialized")

    return await _client.admin.command("ping")
