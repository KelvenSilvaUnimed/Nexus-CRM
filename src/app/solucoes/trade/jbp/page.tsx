"use client";

import AppShell from "@/components/layout/AppShell";
import {
  type FinanceCommitmentSummary,
  type JbpAction,
  type JbpAttachment,
  type JbpPlan,
  type JbpProof,
  type PlanUpdateInput,
  type ProofUploadInput,
  type TicketSummary,
  getFinanceCommitments,
  getJbpActions,
  getJbpAttachments,
  getJbpPlan,
  getJbpProofs,
  getTicketSummaries,
  updateJbpPlan,
  uploadJbpProof,
} from "@/lib/services/jbp";
import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type TabId = "detalhes" | "acoes" | "contrato";

type KpiCard = {
  id: string;
  label: string;
  value: string;
  helper?: string;
  helperTone?: "muted" | "positive";
  progress?: number;
};

type PlanFormState = {
  contatoFornecedor: string;
  objetivosEstrategicos: string;
  termosResumidos: string;
};

type UploadResult = {
  success: boolean;
  error?: string;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "detalhes", label: "Detalhes do Plano" },
  { id: "acoes", label: "Ações de Trade (Ativos)" },
  { id: "contrato", label: "Contrato e Anexos" },
];

const DEFAULT_PLAN_ID = "jbp-2026-procter";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  review: "Em aprovação",
  active: "Plano ativo",
  closed: "Concluído",
  cancelled: "Cancelado",
};

export default function TradeJbpPage() {
  const searchParams = useSearchParams();
  const activePlanId = searchParams?.get("planId") ?? DEFAULT_PLAN_ID;

  const [activeTab, setActiveTab] = useState<TabId>("detalhes");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [plan, setPlan] = useState<JbpPlan | null>(null);
  const [actions, setActions] = useState<JbpAction[]>([]);
  const [attachments, setAttachments] = useState<JbpAttachment[]>([]);
  const [formValues, setFormValues] = useState<PlanFormState>({
    contatoFornecedor: "",
    objetivosEstrategicos: "",
    termosResumidos: "",
  });
  const [savingPlan, setSavingPlan] = useState(false);
  const [planFeedback, setPlanFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [ticketOptions, setTicketOptions] = useState<TicketSummary[]>([]);
  const [financeOptions, setFinanceOptions] = useState<FinanceCommitmentSummary[]>([]);

  const [modalAction, setModalAction] = useState<JbpAction | null>(null);
  const [modalProofs, setModalProofs] = useState<JbpProof[]>([]);
  const [proofsLoading, setProofsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingPlan(true);
      const [planData, actionsData, attachmentsData] = await Promise.all([
        getJbpPlan(activePlanId),
        getJbpActions(activePlanId),
        getJbpAttachments(activePlanId),
      ]);
      if (cancelled) return;
      setPlan(planData);
      setActions(actionsData);
      setAttachments(attachmentsData);
      setFormValues({
        contatoFornecedor: planData?.contatoFornecedor ?? "",
        objetivosEstrategicos: planData?.objetivosEstrategicos ?? "",
        termosResumidos: planData?.termosResumidos ?? "",
      });
      setLoadingPlan(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [activePlanId]);

  useEffect(() => {
    getTicketSummaries().then(setTicketOptions);
  }, []);

  useEffect(() => {
    getFinanceCommitments(activePlanId).then(setFinanceOptions);
  }, [activePlanId]);

  const planStatusLabel = plan ? statusLabels[plan.status] ?? plan.status : "";

  const kpiCards = useMemo<KpiCard[]>(() => {
    if (!plan) return [];
    const progress =
      plan.investimentoTotal > 0 ? Math.min(100, Math.round((plan.realizadoAtual / plan.investimentoTotal) * 100)) : 0;
    const growthHelper =
      typeof plan.metaCrescimentoPercentual === "number"
        ? `${plan.metaCrescimentoPercentual >= 0 ? "+" : ""}${plan.metaCrescimentoPercentual}% vs. Ano Anterior`
        : undefined;

    return [
      {
        id: "faturamento",
        label: "Meta Faturamento (Período)",
        value: currencyFormatter.format(plan.metaFaturamento ?? 0),
        helper: growthHelper,
        helperTone: growthHelper
          ? plan.metaCrescimentoPercentual >= 0
            ? "positive"
            : "muted"
          : undefined,
      },
      {
        id: "investimento",
        label: "Investimento Total (Budget)",
        value: currencyFormatter.format(plan.investimentoTotal ?? 0),
        helper: `Cliente: ${currencyFormatter.format(
          plan.investimentoCliente ?? 0,
        )} | Fornec.: ${currencyFormatter.format(plan.investimentoFornecedor ?? 0)}`,
      },
      {
        id: "realizado",
        label: "Budget Realizado (Ações)",
        value: currencyFormatter.format(plan.realizadoAtual ?? 0),
        helper: `${progress}% do total`,
        progress,
      },
      {
        id: "acoes",
        label: "Ações de Trade",
        value: `${plan.totalAcoes ?? 0} planejadas`,
        helper: `${plan.acoesExecutadas ?? 0} executadas, ${plan.acoesEmExecucao ?? 0} em andamento`,
      },
    ];
  }, [plan]);

  const handlePlanSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!plan) return;
    setSavingPlan(true);
    setPlanFeedback(null);
    const payload: PlanUpdateInput = {
      contatoFornecedor: formValues.contatoFornecedor,
      objetivosEstrategicos: formValues.objetivosEstrategicos,
      termosResumidos: formValues.termosResumidos,
    };

    const updated = await updateJbpPlan(plan.id, payload);
    if (updated) {
      setPlan(updated);
      setPlanFeedback({ type: "success", message: "Plano atualizado com sucesso." });
    } else {
      setPlanFeedback({ type: "error", message: "Não foi possível salvar o plano. Tente novamente." });
    }
    setSavingPlan(false);
  };

  const handleOpenProofs = useCallback(
    async (action: JbpAction) => {
      setModalAction(action);
      setProofsLoading(true);
      setModalProofs([]);
      const proofs = await getJbpProofs(action.id);
      setModalProofs(proofs);
      setProofsLoading(false);
    },
    [setModalAction],
  );

  const handleCloseModal = () => {
    setModalAction(null);
    setModalProofs([]);
    setProofsLoading(false);
  };

  const refreshActions = useCallback(
    async (planId: string) => {
      const data = await getJbpActions(planId);
      setActions(data);
    },
    [],
  );

  const handleUploadProof = useCallback(
    async (actionId: string, payload: ProofUploadInput): Promise<UploadResult> => {
      const created = await uploadJbpProof(actionId, payload);
      if (created) {
        setModalProofs((prev) => [created, ...prev]);
        await refreshActions(activePlanId);
        return { success: true };
      }
      return { success: false, error: "Falha ao enviar a comprovação." };
    },
    [activePlanId, refreshActions],
  );

  if (loadingPlan && !plan) {
    return (
      <AppShell>
        <div className="panel p-8 text-center text-sm text-gray-500">Carregando plano JBP...</div>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell>
        <div className="panel p-8 text-center text-sm text-gray-500">
          Não foi possível carregar o JBP solicitado.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="jbp-page">
        <header className="jbp-hero">
          <div>
            <p className="eyebrow">Trade Marketing · Joint Business Plan</p>
            <h1>{plan.nome}</h1>
            <p>
              Fornecedor: <strong>{plan.fornecedor}</strong> · Vigência: {plan.periodoInicio} a {plan.periodoFim}
            </p>
          </div>
          <span className="jbp-status-pill">{planStatusLabel}</span>
        </header>

        <section className="jbp-kpi-grid">
          {kpiCards.map((card) => (
            <article key={card.id} className="jbp-kpi-card">
              <p className="jbp-kpi-label">{card.label}</p>
              <p className="jbp-kpi-value">{card.value}</p>
              {card.progress !== undefined ? (
                <>
                  <div className="jbp-card-progress">
                    <div style={{ width: `${card.progress}%` }} />
                  </div>
                  {card.helper && <p className="jbp-kpi-helper muted">{card.helper}</p>}
                </>
              ) : (
                card.helper && (
                  <p className={`jbp-kpi-helper ${card.helperTone ?? "muted"}`}>{card.helper}</p>
                )
              )}
            </article>
          ))}
        </section>

        <section className="jbp-tabs-card">
          <div className="jbp-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`jbp-tab-button ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="jbp-tab-panels">
            {activeTab === "detalhes" && (
              <DetailsTab
                plan={plan}
                formValues={formValues}
                onChange={setFormValues}
                onSubmit={handlePlanSubmit}
                saving={savingPlan}
                feedback={planFeedback}
              />
            )}
            {activeTab === "acoes" && (
              <ActionsTab actions={actions} onOpenProofs={handleOpenProofs} loading={loadingPlan} />
            )}
            {activeTab === "contrato" && <ContractTab attachments={attachments} />}
          </div>
        </section>
      </div>

      {modalAction && (
        <ProofModal
          key={modalAction.id}
          action={modalAction}
          proofs={modalProofs}
          loading={proofsLoading}
          tickets={ticketOptions}
          financeOptions={financeOptions}
          onClose={handleCloseModal}
          onUpload={handleUploadProof}
        />
      )}
    </AppShell>
  );
}

function DetailsTab({
  plan,
  formValues,
  onChange,
  onSubmit,
  saving,
  feedback,
}: {
  plan: JbpPlan;
  formValues: PlanFormState;
  onChange: (next: PlanFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  feedback: { type: "success" | "error"; message: string } | null;
}) {
  const handleField =
    (field: keyof PlanFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...formValues, [field]: event.target.value });
    };

  return (
    <form className="jbp-form" onSubmit={onSubmit}>
      <div className="jbp-two-column">
        <div className="jbp-form-group">
          <label htmlFor="responsavel">Responsável Interno (Trade)</label>
          <input id="responsavel" name="responsavel" value={plan.responsavelInterno?.nome ?? ""} readOnly />
        </div>
        <div className="jbp-form-group">
          <label htmlFor="contato-fornecedor">Contato Chave (Fornecedor)</label>
          <input
            id="contato-fornecedor"
            name="contato-fornecedor"
            value={formValues.contatoFornecedor}
            onChange={handleField("contatoFornecedor")}
          />
        </div>
      </div>

      <div className="jbp-form-group">
        <label htmlFor="objetivos">Objetivos Estratégicos</label>
        <textarea
          id="objetivos"
          name="objetivos"
          rows={4}
          value={formValues.objetivosEstrategicos}
          onChange={handleField("objetivosEstrategicos")}
        />
      </div>

      <div className="jbp-form-group">
        <label htmlFor="termos">Termos e Condições (Resumo)</label>
        <textarea
          id="termos"
          name="termos"
          rows={3}
          value={formValues.termosResumidos}
          onChange={handleField("termosResumidos")}
        />
      </div>

      {feedback && <p className={`jbp-feedback ${feedback.type}`}>{feedback.message}</p>}

      <div className="jbp-form-actions">
        <button type="button" className="ghost-button" disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function ActionsTab({
  actions,
  onOpenProofs,
  loading,
}: {
  actions: JbpAction[];
  onOpenProofs: (action: JbpAction) => void;
  loading: boolean;
}) {
  return (
    <div className="jbp-actions">
      <div className="jbp-actions-header">
        <div>
          <p className="eyebrow">Ativos contratados</p>
          <h3>Execução ao longo do período</h3>
        </div>
        <button type="button" className="primary-button">
          Adicionar nova ação
        </button>
      </div>
      <div className="jbp-actions-table">
        <table>
          <thead>
            <tr>
              <th>Ação / Ativo</th>
              <th>Tipo</th>
              <th>Custo (Budget)</th>
              <th>Período</th>
              <th>Status</th>
              <th>Vínculos</th>
              <th>Gestão</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => (
              <tr key={action.id}>
                <td>
                  <strong>{action.nome}</strong>
                </td>
                <td>{action.tipoAtivo}</td>
                <td>{currencyFormatter.format(action.custoPrevisto ?? 0)}</td>
                <td>
                  {action.periodoInicio} - {action.periodoFim}
                </td>
                <td>
                  <span className={`jbp-status-chip ${getStatusTone(action.status)}`}>{action.status}</span>
                </td>
                <td>
                  <div className="jbp-link-stack">
                    {action.atendimentoTicket ? (
                      <a
                        href={action.atendimentoTicket.url ?? `/solucoes/atendimento/${action.atendimentoTicket.id}`}
                        className="jbp-link-pill"
                      >
                        Ticket #{action.atendimentoTicket.codigo}
                      </a>
                    ) : (
                      <span className="jbp-link-pill muted">Sem ticket</span>
                    )}
                    {action.financeiroCompromisso ? (
                      <a
                        href={
                          action.financeiroCompromisso.url ??
                          `/financeiro/compromissos/${action.financeiroCompromisso.id}`
                        }
                        className="jbp-link-pill"
                      >
                        {action.financeiroCompromisso.centroCusto}
                      </a>
                    ) : (
                      <span className="jbp-link-pill muted">Sem financeiro</span>
                    )}
                  </div>
                </td>
                <td className="jbp-action-controls">
                  <button type="button" className="ghost-button" onClick={() => onOpenProofs(action)}>
                    Gerenciar comprovações ({action.comprovacoes})
                  </button>
                  <button type="button" className="link-button">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!actions.length && !loading && (
          <div className="p-6 text-center text-sm text-gray-400">Nenhuma ação cadastrada para este plano.</div>
        )}
      </div>
    </div>
  );
}

function ContractTab({ attachments }: { attachments: JbpAttachment[] }) {
  return (
    <div className="jbp-attachments">
      <div className="jbp-attachments-header">
        <p className="eyebrow">Documentos oficiais</p>
        <h3>Contrato e anexos do plano</h3>
      </div>
      <ul>
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <div className="jbp-attachment-meta">
              <span className={`jbp-attachment-icon ${attachment.tipo}`} aria-hidden="true" />
              <div>
                <strong>{attachment.nomeArquivo}</strong>
                {attachment.descricao && <p>{attachment.descricao}</p>}
              </div>
            </div>
            <div className="jbp-attachment-actions">
              <a
                href={attachment.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="link-button"
                aria-label={`Visualizar ${attachment.nomeArquivo}`}
              >
                Visualizar
              </a>
              <a
                href={attachment.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="link-button"
                aria-label={`Download ${attachment.nomeArquivo}`}
              >
                Download
              </a>
            </div>
          </li>
        ))}
      </ul>

      {!attachments.length && (
        <div className="jbp-proof-empty">Nenhum anexo cadastrado para este plano até o momento.</div>
      )}

      <div className="jbp-upload-dropzone">
        <p className="eyebrow">Novo anexo</p>
        <h4>Arraste e solte arquivos ou clique para procurar</h4>
        <p className="muted">PDF, PNG, JPG, XLSX até 10MB</p>
        <button type="button" className="primary-button">
          Adicionar anexo
        </button>
      </div>
    </div>
  );
}

const PROOF_TYPES = ["Foto", "Nota Fiscal", "Relatório", "Print Mídia"];
const ALLOWED_FILE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function ProofModal({
  action,
  proofs,
  loading,
  tickets,
  financeOptions,
  onClose,
  onUpload,
}: {
  action: JbpAction;
  proofs: JbpProof[];
  loading: boolean;
  tickets: TicketSummary[];
  financeOptions: FinanceCommitmentSummary[];
  onClose: () => void;
  onUpload: (actionId: string, payload: ProofUploadInput) => Promise<UploadResult>;
}) {
  const [uploadState, setUploadState] = useState<{
    tipo: string;
    arquivo: File | null;
    suporteTicketId: string;
    financeiroLancamentoId: string;
  }>({
    tipo: PROOF_TYPES[0],
    arquivo: null,
    suporteTicketId: "",
    financeiroLancamentoId: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadFeedback(null);
    if (!file) {
      setUploadState((prev) => ({ ...prev, arquivo: null }));
      return;
    }
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      setUploadFeedback({
        type: "error",
        message: "Tipo de arquivo não suportado. Utilize PDF, imagens ou planilhas.",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadFeedback({
        type: "error",
        message: "Arquivo maior que 10MB.",
      });
      return;
    }
    setUploadState((prev) => ({ ...prev, arquivo: file }));
  };

  const handleUpload = async () => {
    setUploadFeedback(null);
    if (!uploadState.arquivo) {
      setUploadFeedback({ type: "error", message: "Selecione um arquivo para enviar." });
      return;
    }
    if (!uploadState.suporteTicketId || !uploadState.financeiroLancamentoId) {
      setUploadFeedback({
        type: "error",
        message: "Vincule a comprovação a um ticket e a um lançamento financeiro.",
      });
      return;
    }
    setUploading(true);
    const result = await onUpload(action.id, {
      tipo: uploadState.tipo,
      arquivo: uploadState.arquivo,
      suporteTicketId: uploadState.suporteTicketId,
      financeiroLancamentoId: uploadState.financeiroLancamentoId,
    });
    setUploading(false);

    if (result.success) {
      setUploadFeedback({ type: "success", message: "Comprovação enviada." });
      setUploadState({
        tipo: PROOF_TYPES[0],
        arquivo: null,
        suporteTicketId: "",
        financeiroLancamentoId: "",
      });
    } else {
      setUploadFeedback({ type: "error", message: result.error ?? "Falha ao enviar." });
    }
  };

  return (
    <div className="jbp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="jbp-modal">
        <div className="jbp-modal-header">
          <div>
            <p className="eyebrow">Gestão de comprovação</p>
            <h3>{action.nome}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar modal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="jbp-upload-form">
          <div className="jbp-form-group">
            <label htmlFor="tipo-comprovacao">Tipo de comprovação</label>
            <select
              id="tipo-comprovacao"
              value={uploadState.tipo}
              onChange={(event) => setUploadState((prev) => ({ ...prev, tipo: event.target.value }))}
            >
              {PROOF_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="jbp-form-group">
            <label htmlFor="ticket-vinculo">Ticket de Atendimento</label>
            <select
              id="ticket-vinculo"
              value={uploadState.suporteTicketId}
              onChange={(event) => setUploadState((prev) => ({ ...prev, suporteTicketId: event.target.value }))}
            >
              <option value="">Selecione</option>
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  #{ticket.codigo} · {ticket.assunto}
                </option>
              ))}
            </select>
          </div>

          <div className="jbp-form-group">
            <label htmlFor="financeiro-vinculo">Lançamento Financeiro</label>
            <select
              id="financeiro-vinculo"
              value={uploadState.financeiroLancamentoId}
              onChange={(event) => setUploadState((prev) => ({ ...prev, financeiroLancamentoId: event.target.value }))}
            >
              <option value="">Selecione</option>
              {financeOptions.map((finance) => (
                <option key={finance.id} value={finance.id}>
                  {finance.referencia} {finance.centroCusto ? `· ${finance.centroCusto}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="jbp-form-group">
            <label htmlFor="arquivo-comprovacao">Arquivo</label>
            <input id="arquivo-comprovacao" type="file" onChange={handleFileChange} />
            <p className="jbp-form-hint">PDF, PNG, JPG, XLSX até 10MB</p>
          </div>

          {uploadFeedback && <p className={`jbp-feedback ${uploadFeedback.type}`}>{uploadFeedback.message}</p>}

          <div className="jbp-form-actions">
            <button type="button" className="primary-button" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Enviando..." : "Adicionar comprovação"}
            </button>
          </div>
        </div>

        <div className="jbp-proof-grid">
          {loading && <div className="jbp-proof-empty">Carregando comprovações...</div>}
          {!loading && !proofs.length && (
            <div className="jbp-proof-empty">Nenhuma comprovação anexada para esta ação ainda.</div>
          )}
          {!loading &&
            proofs.map((proof) => (
              <article key={proof.id} className="jbp-proof-card document">
                <header>
                  <strong>{proof.tipo}</strong>
                  <p className="muted">
                    Enviado por {proof.criadoPor.nome} em {proof.criadoEm}
                  </p>
                </header>
                {proof.thumbnailUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proof.thumbnailUrl} alt={proof.label} />
                  </>
                ) : (
                  <span className="jbp-attachment-icon pdf" aria-hidden="true" />
                )}
                <p>{proof.label}</p>
                <div className="jbp-link-stack">
                  {proof.suporteTicket ? (
                    <a
                      href={proof.suporteTicket.url ?? `/solucoes/atendimento/${proof.suporteTicket.id}`}
                      className="jbp-link-pill"
                    >
                      Ticket #{proof.suporteTicket.codigo}
                    </a>
                  ) : (
                    <span className="jbp-link-pill muted">Sem ticket</span>
                  )}
                  {proof.financeiroLancamento ? (
                    <a
                      href={
                        proof.financeiroLancamento.url ?? `/financeiro/compromissos/${proof.financeiroLancamento.id}`
                      }
                      className="jbp-link-pill"
                    >
                      {proof.financeiroLancamento.referencia}
                    </a>
                  ) : (
                    <span className="jbp-link-pill muted">Sem financeiro</span>
                  )}
                </div>
                <a href={proof.arquivoUrl} className="link-button" target="_blank" rel="noreferrer">
                  Abrir arquivo
                </a>
              </article>
            ))}
        </div>
      </div>
    </div>
  );
}

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (["executada", "executado", "done"].includes(normalized)) return "success";
  if (["em execução", "em execucao", "running"].includes(normalized)) return "info";
  return "warning";
}
