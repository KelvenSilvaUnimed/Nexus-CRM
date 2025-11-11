"""Entry-point for the Nexus CRM FastAPI application."""
from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.core.config import settings


def get_application() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version=settings.api_version,
        docs_url="/docs",
        openapi_url=f"{settings.api_prefix}/openapi.json",
    )

    app.include_router(health_router, prefix=settings.api_prefix)

    return app


app = get_application()
