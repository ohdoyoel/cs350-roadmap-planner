import argparse
import os
import smtplib
from email.mime.text import MIMEText

from db.client import load_dotenv


def get_required_env(name: str) -> str:
    load_dotenv()
    value = os.getenv(name)
    if value is None or value == "":
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Send a Gmail SMTP smoke-test email.")
    parser.add_argument(
        "--to",
        required=True,
        help="Recipient email address.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    username = get_required_env("SMTP_USERNAME").strip()
    password = get_required_env("SMTP_PASSWORD").replace(" ", "")
    from_email = os.getenv("SMTP_FROM_EMAIL") or username

    message = MIMEText(
        "Roadmap Planner Gmail SMTP smoke test.",
        _charset="utf-8",
    )
    message["Subject"] = "Roadmap Planner Gmail SMTP test"
    message["From"] = from_email
    message["To"] = args.to

    smtp = smtplib.SMTP("smtp.gmail.com", 587, timeout=30)
    try:
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        smtp.login(username, password)
        smtp.sendmail(from_email, args.to, message.as_string())
    finally:
        smtp.quit()

    print(f"Sent Gmail SMTP test email to {args.to}")


if __name__ == "__main__":
    main()
