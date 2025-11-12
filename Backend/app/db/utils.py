from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def set_tenant_search_path(session: AsyncSession, tenant_schema: str) -> None:
    """Set search_path for the current transaction to the tenant schema and tenant_admin.

    Use at the beginning of a request-bound transaction.
    """
    await session.execute(
        text("SET LOCAL search_path TO :s1, tenant_admin"),
        {"s1": tenant_schema},
    )

