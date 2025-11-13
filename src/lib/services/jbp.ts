import { fetchJson } from "@/lib/api";

const BASE_PATH = "/api/v1/solucoes/trade-marketing/jbps";
const ACTIONS_PATH = "/api/v1/solucoes/trade-marketing/jbp-acoes";

export type JbpPlan = {
  id: string;
  nome: string;
  fornecedor: string;
  periodoInicio: string;
  periodoFim: string;
  status: string;
  responsavelInterno: {
    id: string;
    nome: string;
  };
  contatoFornecedor: string;
  objetivosEstrategicos: string;
  termosResumidos: string;
  metaFaturamento: number;
  metaCrescimentoPercentual: number;
  investimentoTotal: number;
  investimentoCliente: number;
  investimentoFornecedor: number;
  realizadoAtual: number;
  totalAcoes: number;
  acoesExecutadas: number;
  acoesEmExecucao: number;
};

export type JbpAction = {
  id: string;
  nome: string;
  tipoAtivo: string;
  custoPrevisto: number;
  periodoInicio: string;
  periodoFim: string;
  status: string;
  comprovacoes: number;
  atendimentoTicket?: {
    id: string;
    codigo: string;
    assunto: string;
    url?: string;
  };
  financeiroCompromisso?: {
    id: string;
    centroCusto: string;
    url?: string;
  };
};

export type JbpAttachment = {
  id: string;
  nomeArquivo: string;
  tipo: "pdf" | "sheet" | "image";
  descricao?: string;
  url?: string;
};

export type JbpProof = {
  id: string;
  tipo: string;
  label: string;
  arquivoUrl: string;
  thumbnailUrl?: string;
  suporteTicket?: {
    id: string;
    codigo: string;
    assunto: string;
    url?: string;
  };
  financeiroLancamento?: {
    id: string;
    referencia: string;
    url?: string;
  };
  criadoEm: string;
  criadoPor: {
    id: string;
    nome: string;
  };
};

export type PlanUpdateInput = {
  contatoFornecedor: string;
  objetivosEstrategicos: string;
  termosResumidos: string;
};

export type ProofUploadInput = {
  tipo: string;
  arquivo: File;
  suporteTicketId: string;
  financeiroLancamentoId: string;
};

export type TicketSummary = {
  id: string;
  codigo: string;
  assunto: string;
};

export type FinanceCommitmentSummary = {
  id: string;
  referencia: string;
  centroCusto?: string;
};

export async function getJbpPlan(planId: string) {
  return fetchJson<JbpPlan | null>(`${BASE_PATH}/${planId}`, null);
}

export async function getJbpActions(planId: string) {
  return fetchJson<JbpAction[]>(`${BASE_PATH}/${planId}/acoes`, []);
}

export async function getJbpAttachments(planId: string) {
  return fetchJson<JbpAttachment[]>(`${BASE_PATH}/${planId}/anexos`, []);
}

export async function updateJbpPlan(planId: string, payload: PlanUpdateInput) {
  return fetchJson<JbpPlan | null>(`${BASE_PATH}/${planId}`, null, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getJbpProofs(actionId: string) {
  return fetchJson<JbpProof[]>(`${ACTIONS_PATH}/${actionId}/comprovacoes`, []);
}

export async function uploadJbpProof(actionId: string, input: ProofUploadInput) {
  const formData = new FormData();
  formData.append("tipo", input.tipo);
  formData.append("arquivo", input.arquivo);
  formData.append("suporteTicketId", input.suporteTicketId);
  formData.append("financeiroLancamentoId", input.financeiroLancamentoId);
  return fetchJson<JbpProof | null>(`${ACTIONS_PATH}/${actionId}/comprovacoes`, null, {
    method: "POST",
    body: formData,
  });
}

export async function getTicketSummaries() {
  return fetchJson<TicketSummary[]>(`/api/v1/solucoes/atendimento/tickets?simplified=1`, []);
}

export async function getFinanceCommitments(planId: string) {
  return fetchJson<FinanceCommitmentSummary[]>(
    `/api/v1/financeiro/compromissos?jbpPlanId=${planId}`,
    [],
  );
}
