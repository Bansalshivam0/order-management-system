from pathlib import Path
import os


def load_env_file() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()


class Settings:
    app_name = "Order Management System API"
    app_version = "0.1.0"
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/order_management",
    )
    twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_from_number = os.getenv("TWILIO_FROM_NUMBER", "")


settings = Settings()
