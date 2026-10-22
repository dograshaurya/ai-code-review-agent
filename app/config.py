from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Code Review Agent"
    app_env: str = "development"
    ollama_base_url: str = "http://localhost:11434"
    llm_model: str = "qwen2.5:3b"
    request_timeout_seconds: float = 120.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
