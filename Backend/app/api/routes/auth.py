from fastapi import APIRouter, HTTPException, status

from app.models import (
    CheckEmailRequest,
    CheckEmailResponse,
    LogoutRequest,
    TokenRequest,
    TokenResponse,
)
from app.services import data_store

router = APIRouter()


@router.post(
    "/check-email",
    summary="Identify tenant and user based on email",
    response_model=CheckEmailResponse,
)
async def check_email(payload: CheckEmailRequest) -> CheckEmailResponse:
    user = data_store.find_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")
    return CheckEmailResponse(**user.to_check_email_payload())


@router.post(
    "/token",
    summary="Authenticate user and get session token",
    response_model=TokenResponse,
)
async def login_for_access_token(payload: TokenRequest) -> TokenResponse:
    user = data_store.validate_credentials(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais invalidas.")

    token = data_store.generate_token(user)
    return TokenResponse(
        access_token=token,
        userName=user.name,
        tenantId=user.tenant_id,
        tenantName=user.tenant_name,
        tenantLogoUrl=user.tenant_logo_url,
        roles=user.roles,
    )


@router.post("/logout", summary="Logout user")
async def logout(payload: LogoutRequest) -> dict:
    data_store.invalidate_token(payload.token)
    return {"message": "Sessao finalizada com sucesso."}

