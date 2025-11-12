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
    default_tenant_id: str = "tenant_demo"
    default_user_id: str = "user_demo"
    default_user_roles: str = "user,data_admin"
    # Auth
    secret_key: str = "change-this-in-.env"
    jwt_algorithm: str = "HS256"
    access_token_expires_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def model_post_init(self, __context: dict) -> None:  # type: ignore[override]
        # Normalize common Postgres URLs to asyncpg driver if user provides postgres:// or postgresql://
        if self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif self.database_url.startswith("postgresql://") and "+asyncpg" not in self.database_url:
            self.database_url = self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)


settings = Settings()
