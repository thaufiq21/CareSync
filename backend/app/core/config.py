"""Application configuration using Pydantic Settings"""
import secrets
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_ENV: str = "development"
    APP_NAME: str = "CareSync"
    DEBUG: bool = True
    DEMO_MODE: bool = True

    # URLs
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    # Database - standard location in backend directory
    DATABASE_URL: str = "sqlite:///./caresync.db"

    # Session / JWT
    SESSION_SECRET: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours
    ALGORITHM: str = "HS256"

    # Admin seed (used only by init script, never shipped as default)
    ADMIN_NAME: str = "Administrator"
    ADMIN_EMAIL: str = "admin@caresync.demo"
    ADMIN_PASSWORD: str = "CHANGE_ME_BEFORE_USE"

    # Optional AI
    AI_PROVIDER: Optional[str] = None
    AI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-4o-mini"
    AI_MAX_TOKENS: int = 500

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def ai_enabled(self) -> bool:
        return bool(self.AI_API_KEY and self.AI_PROVIDER)


settings = Settings()
