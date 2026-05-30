import hashlib
import os
import secrets
import hmac

from db.client import load_dotenv

PASSWORD_HASH_ALGORITHM = "pbkdf2_sha256"
PASSWORD_HASH_ITERATIONS = 600_000


def create_session_token() -> str:
    return secrets.token_urlsafe(32)


def create_email_verification_token() -> str:
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def hash_email_verification_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_session_idle_timeout_minutes() -> int:
    load_dotenv()
    return int(os.getenv("SESSION_IDLE_TIMEOUT_MINUTES", "60"))


def get_password_pepper() -> str:
    load_dotenv()
    pepper = os.getenv("PASSWORD_PEPPER")
    if pepper is None or pepper == "":
        raise RuntimeError("Missing required environment variable: PASSWORD_PEPPER")
    return pepper


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    peppered_password = f"{password}{get_password_pepper()}".encode("utf-8")
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        peppered_password,
        salt.encode("utf-8"),
        PASSWORD_HASH_ITERATIONS,
    ).hex()
    return f"{PASSWORD_HASH_ALGORITHM}${PASSWORD_HASH_ITERATIONS}${salt}${password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected_hash = stored_hash.split("$", 3)
        iterations_int = int(iterations)
    except ValueError:
        return False

    if algorithm != PASSWORD_HASH_ALGORITHM:
        return False

    peppered_password = f"{password}{get_password_pepper()}".encode("utf-8")
    actual_hash = hashlib.pbkdf2_hmac(
        "sha256",
        peppered_password,
        salt.encode("utf-8"),
        iterations_int,
    ).hex()
    return hmac.compare_digest(actual_hash, expected_hash)
