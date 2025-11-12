"""Data-centric Pydantic models for the Nexus CRM API."""
from __future__ import annotations

from datetime import datetime
from typing import Any, List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    id: str
    name: str


class SchemasResponse(BaseModel):
    tabelasBase: List[str] = Field(default_factory=list)
    objetosCustom: List[str] = Field(default_factory=list)


class SQLTestRequest(BaseModel):
    query: str = Field(..., description="SQL query that must be validated (SELECT only).")


class SQLTestResponse(BaseModel):
    isValid: bool = Field(alias="isValid")
    rowsAffected: int = 0


class MetaObjectCreate(BaseModel):
    idObjeto: str = Field(..., description="Technical identifier, e.g. obj_vendas_por_visita")
    nomeAmigavel: str = Field(..., description="Business friendly name")
    tipo: Literal["BASE", "CUSTOMIZADO"] = "CUSTOMIZADO"
    status: str = "Ativo"
    descricao: str | None = None
    sqlQuery: str | None = Field(
        default=None, description="Optional SQL stored for reference (Estudio SQL)."
    )
    fields: List[str] = Field(default_factory=list)


class MetaObjectResponse(BaseModel):
    metaId: str
    nomeAmigavel: str
    idObjeto: str
    tipo: Literal["BASE", "CUSTOMIZADO"]
    status: str
    profiles: List[UserProfile] = Field(default_factory=list)
    descricao: str | None = None
    fields: List[str] = Field(default_factory=list)


class MetaObjectPermissionUpdate(BaseModel):
    profiles: List[str]


class MetaObjectPermissionResponse(BaseModel):
    profiles: List[str]
    availableProfiles: List[UserProfile]


class WidgetPayload(BaseModel):
    id: str
    title: str
    chartType: Literal["bar", "line", "pie", "kpi"]
    objectId: str
    objectLabel: str
    groupBy: str
    aggregate: str
    aggregateField: str
    data: List[dict[str, Any]] = Field(default_factory=list)
    publishTargets: List[str] = Field(default_factory=list)


class DashboardSaveRequest(BaseModel):
    id: str | None = None
    name: str
    widgets: List[WidgetPayload]
    layout: List[Any] | None = None


class DashboardListResponse(BaseModel):
    dashboards: List[DashboardSaveRequest] = Field(default_factory=list)


class WidgetQueryRequest(BaseModel):
    objectId: str
    groupBy: str
    aggregate: Literal["SUM", "AVG", "COUNT"]
    aggregateField: str


class WidgetQueryResponse(BaseModel):
    rows: List[dict[str, Any]] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Sales / Marketing / Activities
# ---------------------------------------------------------------------------


class LeadBase(BaseModel):
    nome: str
    email: str
    status: str = "Novo"
    origem: Optional[str] = None
    owner: str


class LeadCreate(LeadBase):
    pass


class LeadResponse(LeadBase):
    id: str
    createdAt: datetime


class OpportunityBase(BaseModel):
    nome: str
    stage: str
    valor: float
    probabilidade: float
    owner: str


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityResponse(OpportunityBase):
    id: str
    updatedAt: datetime


class AccountBase(BaseModel):
    nome: str
    segmento: str
    cidade: Optional[str] = None
    estado: Optional[str] = None


class AccountCreate(AccountBase):
    pass


class AccountResponse(AccountBase):
    id: str


class ContactBase(BaseModel):
    nome: str
    email: str
    telefone: Optional[str] = None
    conta: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactResponse(ContactBase):
    id: str


class CampaignBase(BaseModel):
    nome: str
    status: str
    investimento: float
    inicio: str
    fim: str


class CampaignCreate(CampaignBase):
    pass


class CampaignResponse(CampaignBase):
    id: str


class SegmentBase(BaseModel):
    nome: str
    regra: str
    tamanho: int


class SegmentCreate(SegmentBase):
    pass


class SegmentResponse(SegmentBase):
    id: str


class ActivityItem(BaseModel):
    id: str
    customer: str
    action: str
    status: str
    badge: str
    dueDate: datetime


class FunnelStage(BaseModel):
    title: str
    amount: str
    items: int
    progress: float
    accent: str


class KPIItem(BaseModel):
    label: str
    value: str
    change: str


class DashboardSummary(BaseModel):
    kpiCards: List[KPIItem]
    funnelStages: List[FunnelStage]
    activities: List[dict[str, str]]


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------


class CheckEmailRequest(BaseModel):
    email: EmailStr


class CheckEmailResponse(BaseModel):
    email: EmailStr
    userName: str
    tenantId: str
    tenantName: str
    tenantLogoUrl: Optional[str] = None


class TokenRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    userName: str
    tenantId: str
    tenantName: str
    tenantLogoUrl: Optional[str] = None
    roles: List[str] = Field(default_factory=list)


class LogoutRequest(BaseModel):
    token: str
