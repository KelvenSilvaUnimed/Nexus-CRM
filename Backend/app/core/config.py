"""Application-wide configuration objects."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Nexus CRM API"
    api_version: str = "0.1.0"
    environment: str = "development"
    api_prefix: str = "/api"
    database_url: str = "postgresql+asyncpg://nexus:nexus@localhost:5432/nexus_crm"
    tenant_admin_schema: str = "tenant_admin"
    sqlalchemy_echo: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
