from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    
    # Auth
    SECRET_KEY: str = "supersecretkey_change_in_production_meditrust_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # 7 days
    
    # Monnify
    MONNIFY_API_KEY: str
    MONNIFY_SECRET_KEY: str
    MONNIFY_BASE_URL: str = "https://sandbox.monnify.com"
    MONNIFY_CONTRACT_CODE: str = "1234567890" # Dummy default
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    CELERY_ALWAYS_EAGER: bool = False
    
    # App Settings
    APP_NAME: str = "Meditrust Backend"
    VERIFICATION_URL_BASE: str = "https://meditrust.com/verify"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
