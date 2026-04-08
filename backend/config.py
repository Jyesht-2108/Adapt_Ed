"""Configuration management for AdaptEd backend."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Groq API
    groq_api_key: str
    groq_base_url: str = "https://api.groq.com/openai/v1"
    
    # Supabase
    supabase_url: str
    supabase_service_key: str
    
    # Optional
    youtube_api_key: str | None = None
    
    # Server
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://frontend:5173",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
    ]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
