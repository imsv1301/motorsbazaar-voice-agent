from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    groq_api_key: str
    # Local dev: path to JSON file
    google_credentials_path: str = "credentials/service-account.json"
    # Render/cloud: full JSON content as a string (set GOOGLE_CREDENTIALS_JSON env var)
    google_credentials_json: Optional[str] = None
    google_sheet_name: str = "MotorsBazaar Consultations"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # Twilio (for phone call support)
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
