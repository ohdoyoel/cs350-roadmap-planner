import hashlib
import os
import secrets

from db.client import load_dotenv


def create_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_session_idle_timeout_minutes() -> int:
    load_dotenv()
    return int(os.getenv("SESSION_IDLE_TIMEOUT_MINUTES", "60"))
