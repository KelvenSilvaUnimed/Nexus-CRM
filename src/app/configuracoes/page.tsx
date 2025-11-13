"use client";

import AppShell from "@/components/layout/AppShell";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiKey,
  AuditEntry,
  ConfigSection,
  CustomTable,
  ModuleToggle,
  NotificationConfig,
  NotificationTrigger,
  PermissionModule,
  RoleGroup,
  RolePermissionMap,
  SlaRule,
  SlaSettings,
  SystemTable,
  TemplateRecord,
  UserPayload,
  UserRecord,
  WebhookEndpoint,
  addWebhook,
  createCustomTable,
  fetchApiKeys,
  fetchAuditLog,
  fetchCustomTables,
  fetchFieldVisibility,
  fetchModuleToggles,
  fetchNotificationConfig,
  fetchNotificationTriggers,
  fetchPermissionMatrix,
  fetchRoleGroups,
  fetchRolePermissions,
  fetchSlaSettings,
  fetchSystemTables,
  fetchTemplates,
  fetchUsers,
  fetchWebhooks,
  generateApiKey,
  revokeApiKey,
  saveUser,
  toggleWebhook,
  updateFieldVisibility,
  updateModuleToggle,
  updateNotificationConfig,
  updateNotificationTrigger,
  updateRolePermission,
  updateSlaSettings,
  updateTemplate,
  updateUserStatus,
} from "@/lib/services/adminConfig";

const viewFieldOptions: Record<string, string[]> = {
  investimento: ["Admin e Gerente de Trade", "Somente Administrador", "Todos (nao recomendado)"],
  faturamento: ["Admin e Gerente de Trade", "Somente Administrador", "Todos"],
  contrato: ["Todos (Visivel para Campo)", "Admin e Gerente de Trade", "Somente Administrador"],
};

const viewFieldLabels: Record<string, string> = {
  investimento: "Ver 'Investimento Total (Budget)'",
  faturamento: "Ver 'Meta Faturamento (Periodo)'",
  contrato: "Ver aba 'Contrato e Anexos'",
};

const sidebarSections: { id: ConfigSection; label: string; description: string }[] = [
  { id: "usuarios", label: "Usuarios", description: "Convide, edite e inative acessos" },
  { id: "permissoes", label: "Funcoes e Permissoes", description: "Perfis e matriz de acesso" },
  { id: "dados", label: "Gestao de Dados", description: "Tabelas e campos customizados" },
  { id: "templates", label: "Templates", description: "Contratos e comunicacoes padrao" },
  { id: "notificacoes", label: "Notificacoes", description: "Email, SMS e push" },
  { id: "sla", label: "Regras de SLA", description: "Tempos de resposta e solucao" },
  { id: "configuracoes", label: "Configuracoes Gerais", description: "Modulos e campos sensiveis" },
  { id: "integracoes", label: "Integracoes & API", description: "Chaves, webhooks e SDK" },
  { id: "logs", label: "Log de Atividades", description: "Auditoria completa" },
];

const notificationTabs = [
  { id: "gatilhos", label: "Gatilhos" },
  { id: "email", label: "Config. Email (SMTP)" },
  { id: "sms", label: "Config. SMS" },
  { id: "push", label: "Config. Push" },
] as const;

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState<ConfigSection>("usuarios");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [moduleToggles, setModuleToggles] = useState<ModuleToggle[]>([]);
  const [viewPermissions, setViewPermissions] = useState<Record<string, string>>({});
  const [customTables, setCustomTables] = useState<CustomTable[]>([]);
  const [systemTables, setSystemTables] = useState<SystemTable[]>([]);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>("");
  const [notificationTriggers, setNotificationTriggers] = useState<NotificationTrigger[]>([]);
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    email: { host: "", port: 0, from: "" },
    sms: { provider: "", token: "" },
    push: { provider: "", apiKey: "" },
  });
  const [notificationTab, setNotificationTab] = useState<(typeof notificationTabs)[number]["id"]>("gatilhos");
  const [slaSettings, setSlaSettings] = useState<SlaSettings>({
    workingHours: { start: "08:00", end: "18:00", weekDays: true },
    rules: [],
  });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Set<string>>>({});
  const [activeRoleId, setActiveRoleId] = useState<string>("");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [userInFocus, setUserInFocus] = useState<UserRecord | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        usersData,
        moduleData,
        visibilityData,
        customTablesData,
        systemTablesData,
        templatesData,
        triggersData,
        notificationConfigData,
        slaData,
        apiKeysData,
        webhooksData,
        auditData,
        rolesData,
        modulesMatrixData,
        rolePermissionsData,
      ] = await Promise.all([
        fetchUsers(),
        fetchModuleToggles(),
        fetchFieldVisibility(),
        fetchCustomTables(),
        fetchSystemTables(),
        fetchTemplates(),
        fetchNotificationTriggers(),
        fetchNotificationConfig(),
        fetchSlaSettings(),
        fetchApiKeys(),
        fetchWebhooks(),
        fetchAuditLog(),
        fetchRoleGroups(),
        fetchPermissionMatrix(),
        fetchRolePermissions(),
      ]);

      setUsers(usersData);
      setModuleToggles(moduleData);
      setViewPermissions(visibilityData);
      setCustomTables(customTablesData);
      setSystemTables(systemTablesData);
      setTemplates(templatesData);
      setActiveTemplateId(templatesData[0]?.id ?? "");
      setNotificationTriggers(triggersData);
      setNotificationConfig(notificationConfigData);
      setSlaSettings(slaData);
      setApiKeys(apiKeysData);
      setWebhooks(webhooksData);
      setAuditLog(auditData);
      setRoleGroups(rolesData);
      setPermissionModules(modulesMatrixData);
      const map: Record<string, Set<string>> = {};
      Object.entries(rolePermissionsData as RolePermissionMap).forEach(([roleId, permissions]) => {
        map[roleId] = new Set(permissions);
      });
      setRolePermissions(map);
      setActiveRoleId((prev) => prev || rolesData[0]?.id || "");
    } catch (err) {
      console.error(err);
      setError("Nao foi possivel carregar as configuracoes. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sectionTitle = useMemo(() => {
    const section = sidebarSections.find((item) => item.id === activeSection);
    return section?.label ?? "Configuracoes";
  }, [activeSection]);

  const handleUserSave = async (payload: UserPayload) => {
    const saved = await saveUser(payload);
    if (!saved) return;
    setUsers((prev) => {
      const exists = prev.some((user) => user.id === saved.id);
      return exists ? prev.map((user) => (user.id === saved.id ? saved : user)) : [saved, ...prev];
    });
  };

  const handleStatusToggle = async (userId: string) => {
    const target = users.find((user) => user.id === userId);
    if (!target) return;
    const updated = await updateUserStatus(userId, target.status === "Ativo" ? "Inativo" : "Ativo");
    if (!updated) return;
    setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
  };

  const handlePermissionToggle = async (roleId: string, permissionKey: string) => {
    const currentSet = rolePermissions[roleId] ?? new Set<string>();
    const enable = !currentSet.has(permissionKey);
    const ok = await updateRolePermission(roleId, permissionKey, enable);
    if (!ok) return;
    setRolePermissions((prev) => {
      const next = new Set(prev[roleId] ?? []);
      if (enable) {
        next.add(permissionKey);
      } else {
        next.delete(permissionKey);
      }
      return { ...prev, [roleId]: next };
    });
  };

  const handleModuleToggle = async (moduleId: string) => {
    const toggle = moduleToggles.find((item) => item.id === moduleId);
    if (!toggle) return;
    const ok = await updateModuleToggle(moduleId, !toggle.enabled);
    if (!ok) return;
    setModuleToggles((prev) => prev.map((item) => (item.id === moduleId ? { ...item, enabled: !item.enabled } : item)));
  };

  const handleViewPermissionChange = (key: string, value: string) => {
    setViewPermissions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveViewPermissions = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateFieldVisibility(viewPermissions);
  };

  const handleCreateTable = async () => {
    const created = await createCustomTable(`Tabela Custom ${customTables.length + 1}`);
    if (!created) return;
    setCustomTables((prev) => [...prev, created]);
  };

  const activeTemplate = templates.find((tpl) => tpl.id === activeTemplateId) ?? null;

  const handleTemplateContentChange = (content: string) => {
    if (!activeTemplate) return;
    setTemplates((prev) => prev.map((tpl) => (tpl.id === activeTemplate.id ? { ...tpl, content } : tpl)));
  };

  const handleTemplateSave = async () => {
    if (!activeTemplate) return;
    await updateTemplate(activeTemplate.id, activeTemplate.content);
  };

  const handleTriggerChannelToggle = async (triggerId: string, channel: keyof NotificationTrigger["channels"]) => {
    const trigger = notificationTriggers.find((item) => item.id === triggerId);
    if (!trigger) return;
    const nextChannels = { ...trigger.channels, [channel]: !trigger.channels[channel] };
    const ok = await updateNotificationTrigger(triggerId, { channels: nextChannels });
    if (!ok) return;
    setNotificationTriggers((prev) => prev.map((item) => (item.id === triggerId ? { ...item, channels: nextChannels } : item)));
  };

  const handleTriggerStatusToggle = async (triggerId: string) => {
    const trigger = notificationTriggers.find((item) => item.id === triggerId);
    if (!trigger) return;
    const ok = await updateNotificationTrigger(triggerId, { active: !trigger.active });
    if (!ok) return;
    setNotificationTriggers((prev) => prev.map((item) => (item.id === triggerId ? { ...item, active: !item.active } : item)));
  };

  const handleChannelConfigChange = async (
    channel: keyof NotificationConfig,
    field: string,
    value: string | number,
  ) => {
    await updateNotificationConfig(channel, { [field]: value });
    setNotificationConfig((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [field]: value,
      },
    }));
  };

  const handleSlaWorkingHoursChange = (field: "start" | "end" | "weekDays", value: string | boolean) => {
    setSlaSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value,
      },
    }));
  };

  const handleSlaRuleChange = (
    priority: SlaRule["priority"],
    field: "responseTime" | "responseUnit" | "resolutionTime" | "resolutionUnit",
    value: string,
  ) => {
    setSlaSettings((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) =>
        rule.priority === priority
          ? {
              ...rule,
              [field]: field.includes("Time") ? Number(value) : value,
            }
          : rule,
      ),
    }));
  };

  const handleSlaSave = async () => {
    await updateSlaSettings(slaSettings);
  };

  const handleGenerateApiKey = async () => {
    const created = await generateApiKey("Nova chave");
    if (!created) return;
    setApiKeys((prev) => [created, ...prev]);
  };

  const handleRevokeApiKey = async (keyId: string) => {
    await revokeApiKey(keyId);
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
  };

  const handleAddWebhook = async () => {
    const created = await addWebhook("custom.event", "https://hooks.seudominio.com/payload");
    if (!created) return;
    setWebhooks((prev) => [...prev, created]);
  };

  const handleWebhookToggle = async (webhookId: string) => {
    const webhook = webhooks.find((item) => item.id === webhookId);
    if (!webhook) return;
    await toggleWebhook(webhookId, !webhook.active);
    setWebhooks((prev) => prev.map((item) => (item.id === webhookId ? { ...item, active: !item.active } : item)));
  };

  const openUserModal = (user?: UserRecord) => {
    setUserInFocus(user ?? null);
    setUserModalOpen(true);
  };

  const openPasswordModal = (user: UserRecord) => {
    setUserInFocus(user);
    setPasswordModalOpen(true);
  };

  const handleResetPassword = () => {
    setPasswordModalOpen(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="panel p-8 text-center text-sm text-gray-500">Carregando configuracoes...</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="panel p-8 text-center text-sm text-red-500 space-y-4">
          <p>{error}</p>
          <button type="button" className="primary-button" onClick={loadData}>
            Tentar novamente
          </button>
        </div>
      </AppShell>
    );
  }

  const activeTemplateRecord = templates.find((tpl) => tpl.id === activeTemplateId) ?? null;

  return (
    <AppShell>
      <div className="config-module">
        <aside className="config-sidebar">
          <div className="config-sidebar-header">
            <p className="eyebrow">Administração</p>
            <h2>Nexus Admin Console</h2>
            <p className="muted">Estruture acessos, módulos e dados do tenant.</p>
          </div>
          <nav className="config-nav">
            {sidebarSections.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`config-nav-item ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div>
                    <strong>{section.label}</strong>
                    <p>{section.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="config-content">
          <header className="config-content-header">
            <h1>{sectionTitle}</h1>
          </header>

          {activeSection === "usuarios" && (
            <UserManagementSection
              users={users}
              onCreate={() => openUserModal()}
              onEdit={openUserModal}
              onToggleStatus={handleStatusToggle}
              onResetPassword={openPasswordModal}
            />
          )}

          {activeSection === "permissoes" && activeRoleId && (
            <RolePermissionSection
              roles={roleGroups}
              modules={permissionModules}
              activeRoleId={activeRoleId}
              onSelectRole={setActiveRoleId}
              rolePermissions={rolePermissions[activeRoleId] ?? new Set<string>()}
              onTogglePermission={(permissionKey) => handlePermissionToggle(activeRoleId, permissionKey)}
              editable={Boolean(roleGroups.find((role) => role.id === activeRoleId)?.editable)}
            />
          )}

          {activeSection === "dados" && (
            <DataManagementSection
              customTables={customTables}
              systemTables={systemTables}
              onCreateTable={handleCreateTable}
            />
          )}

          {activeSection === "templates" && activeTemplateRecord && (
            <TemplateSection
              templates={templates}
              activeTemplateId={activeTemplateId}
              onSelectTemplate={setActiveTemplateId}
              onUpdateContent={handleTemplateContentChange}
              onSaveTemplate={handleTemplateSave}
            />
          )}

          {activeSection === "notificacoes" && (
            <NotificationSection
              triggers={notificationTriggers}
              config={notificationConfig}
              activeTab={notificationTab}
              onChangeTab={setNotificationTab}
              onToggleChannel={handleTriggerChannelToggle}
              onToggleTrigger={handleTriggerStatusToggle}
              onChannelConfigChange={handleChannelConfigChange}
            />
          )}

          {activeSection === "sla" && (
            <SlaSection
              settings={slaSettings}
              onWorkingHoursChange={handleSlaWorkingHoursChange}
              onRuleChange={handleSlaRuleChange}
              onSave={handleSlaSave}
            />
          )}

          {activeSection === "configuracoes" && (
            <SystemConfigSection
              modules={moduleToggles}
              onModuleToggle={handleModuleToggle}
              viewPermissions={viewPermissions}
              onChangeViewPermission={handleViewPermissionChange}
              onSaveViewPermission={handleSaveViewPermissions}
            />
          )}

          {activeSection === "integracoes" && (
            <IntegrationSection
              apiKeys={apiKeys}
              onGenerateKey={handleGenerateApiKey}
              onRevokeKey={handleRevokeApiKey}
              webhooks={webhooks}
              onAddWebhook={handleAddWebhook}
              onToggleWebhook={handleWebhookToggle}
            />
          )}

          {activeSection === "logs" && <AuditLogSection entries={auditLog} />}
        </main>
      </div>

      {userModalOpen && (
        <UserModal
          open={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          onSave={handleUserSave}
          initialData={userInFocus}
        />
      )}

      {passwordModalOpen && userInFocus && (
        <PasswordModal
          user={userInFocus}
          open={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          onReset={handleResetPassword}
        />
      )}
    </AppShell>
  );
}

function UserManagementSection({
  users,
  onCreate,
  onEdit,
  onToggleStatus,
  onResetPassword,
}: {
  users: UserRecord[];
  onCreate: () => void;
  onEdit: (user: UserRecord) => void;
  onToggleStatus: (userId: string) => void;
  onResetPassword: (user: UserRecord) => void;
}) {
  return (
    <section className="config-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Equipe</p>
          <h3>Gerenciamento de usuários</h3>
        </div>
        <button type="button" className="primary-button" onClick={onCreate}>
          Novo usuário
        </button>
      </div>
      <div className="config-table-wrapper">
        <table className="config-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`config-status ${user.status === "Ativo" ? "is-active" : "is-inactive"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="config-actions">
                  <button type="button" className="link-button" onClick={() => onEdit(user)}>
                    Editar
                  </button>
                  <button type="button" className="ghost-button" onClick={() => onResetPassword(user)}>
                    Resetar senha
                  </button>
                  <button type="button" className="ghost-button" onClick={() => onToggleStatus(user.id)}>
                    {user.status === "Ativo" ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <div className="config-empty-state">Nenhum usuário cadastrado.</div>}
      </div>
    </section>
  );
}

function RolePermissionSection({
  roles,
  modules,
  activeRoleId,
  onSelectRole,
  rolePermissions,
  onTogglePermission,
  editable,
}: {
  roles: RoleGroup[];
  modules: PermissionModule[];
  activeRoleId: string;
  onSelectRole: (roleId: string) => void;
  rolePermissions: Set<string>;
  onTogglePermission: (permissionKey: string) => void;
  editable: boolean;
}) {
  return (
    <section className="config-role-wrapper">
      <nav className="config-role-nav">
        <div className="config-role-nav-header">
          <h4>Grupos de funções</h4>
          <button type="button" className="ghost-button small">
            Novo grupo
          </button>
        </div>
        <ul>
          {roles.map((role) => {
            const isActive = role.id === activeRoleId;
            return (
              <li key={role.id}>
                <button
                  type="button"
                  className={`config-role-link ${isActive ? "is-active" : ""}`}
                  onClick={() => onSelectRole(role.id)}
                >
                  <strong>{role.name}</strong>
                  <p>{role.description}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="config-role-panel">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Permissões</p>
            <h3>
              Matriz para:{" "}
              <span className="text-blue-500">{roles.find((role) => role.id === activeRoleId)?.name ?? "--"}</span>
            </h3>
          </div>
          {!editable && <span className="config-badge">Bloqueado (perfil padrão)</span>}
        </div>
        <div className="config-permission-grid">
          {modules.map((module) => (
            <article key={module.id} className="config-permission-card">
              <header>
                <h4>{module.name}</h4>
              </header>
              <div className="config-permission-list">
                {module.toggles.map((toggle) => {
                  const permissionKey = `${module.id}.${toggle.id}`;
                  const checked = rolePermissions.has(permissionKey);
                  const disabled = toggle.disabled || !editable;
                  return (
                    <label key={permissionKey} className={disabled ? "is-disabled" : ""}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => !disabled && onTogglePermission(permissionKey)}
                      />
                      <span>{toggle.label}</span>
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DataManagementSection({
  customTables,
  systemTables,
  onCreateTable,
}: {
  customTables: CustomTable[];
  systemTables: SystemTable[];
  onCreateTable: () => void;
}) {
  return (
    <section className="config-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Estrutura</p>
          <h3>Gestão de dados e tabelas</h3>
        </div>
      </div>
      <div className="config-card">
        <header>
          <h4>Tabelas customizadas</h4>
          <p>Crie objetos específicos para o seu negócio.</p>
        </header>
        <button type="button" className="primary-button align-self-start" onClick={onCreateTable}>
          Criar nova tabela
        </button>
        {!customTables.length && <p className="muted">Nenhuma tabela customizada criada ainda.</p>}
        {!!customTables.length && (
          <ul className="config-table-list">
            {customTables.map((table) => (
              <li key={table.id}>
                <div>
                  <strong>{table.name}</strong>
                  <p>
                    {table.fields} campos • Owner {table.owner}
                  </p>
                </div>
                <span className="muted">Atualizado em {table.lastUpdated}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="config-card">
        <header>
          <h4>Tabelas do sistema (core)</h4>
          <p>Personalize campos e visões das tabelas padrão.</p>
        </header>
        <ul className="config-table-list">
          {systemTables.map((table) => (
            <li key={table.id}>
              <div>
                <strong>{table.name}</strong>
                <p>{table.description}</p>
              </div>
              <button type="button" className="link-button">
                Configurar campos
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TemplateSection({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onUpdateContent,
  onSaveTemplate,
}: {
  templates: TemplateRecord[];
  activeTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onUpdateContent: (content: string) => void;
  onSaveTemplate: () => void;
}) {
  const activeTemplate = templates.find((tpl) => tpl.id === activeTemplateId);
  if (!activeTemplate) {
    return (
      <section className="config-panel">
        <div className="config-empty-state">Nenhum template encontrado.</div>
      </section>
    );
  }

  return (
    <section className="config-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Templates</p>
          <h3>Contratos e comunicação padrão</h3>
        </div>
      </div>
      <div className="config-template-layout">
        <aside className="config-template-list">
          <div className="config-role-nav-header">
            <h4>Templates</h4>
            <button type="button" className="ghost-button small">
              Novo template
            </button>
          </div>
          <ul>
            {templates.map((template) => {
              const isActive = template.id === activeTemplateId;
              return (
                <li key={template.id}>
                  <button
                    type="button"
                    className={`config-template-link ${isActive ? "is-active" : ""}`}
                    onClick={() => onSelectTemplate(template.id)}
                  >
                    {template.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
        <div className="config-template-editor">
          <header>
            <h4>Editando: {activeTemplate.name}</h4>
          </header>
          <div className="config-template-editor-body">
            <label>
              <span>Conteúdo (HTML / Markdown)</span>
              <textarea
                className="config-template-textarea"
                value={activeTemplate.content}
                onChange={(event) => onUpdateContent(event.target.value)}
              />
            </label>
            <div className="config-template-variables">
              <h5>Variáveis disponíveis</h5>
              <ul>
                {activeTemplate.variables.map((variable) => (
                  <li key={variable}>{variable}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="config-form-actions">
            <button type="button" className="primary-button" onClick={onSaveTemplate}>
              Salvar template
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function NotificationSection({
  triggers,
  config,
  activeTab,
  onChangeTab,
  onToggleChannel,
  onToggleTrigger,
  onChannelConfigChange,
}: {
  triggers: NotificationTrigger[];
  config: NotificationConfig;
  activeTab: (typeof notificationTabs)[number]["id"];
  onChangeTab: (tab: (typeof notificationTabs)[number]["id"]) => void;
  onToggleChannel: (triggerId: string, channel: keyof NotificationTrigger["channels"]) => void;
  onToggleTrigger: (triggerId: string) => void;
  onChannelConfigChange: (channel: keyof NotificationConfig, field: string, value: string | number) => void;
}) {
  return (
    <section className="config-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Automação</p>
          <h3>Configuração de notificações</h3>
        </div>
      </div>
      <div className="config-card">
        <div className="config-tab-bar">
          {notificationTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`config-tab-button ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => onChangeTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "gatilhos" && (
          <div className="config-trigger-table">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Template</th>
                  <th>Email</th>
                  <th>SMS</th>
                  <th>Push</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {triggers.map((trigger) => (
                  <tr key={trigger.id}>
                    <td>{trigger.event}</td>
                    <td>{trigger.template}</td>
                    <td>
                      <button
                        type="button"
                        className={`config-dot ${trigger.channels.email ? "is-on" : ""}`}
                        onClick={() => onToggleChannel(trigger.id, "email")}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`config-dot ${trigger.channels.sms ? "is-on" : ""}`}
                        onClick={() => onToggleChannel(trigger.id, "sms")}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`config-dot ${trigger.channels.push ? "is-on" : ""}`}
                        onClick={() => onToggleChannel(trigger.id, "push")}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`config-badge ${trigger.active ? "badge-success" : ""}`}
                        onClick={() => onToggleTrigger(trigger.id)}
                      >
                        {trigger.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td>
                      <button type="button" className="link-button">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "email" && (
          <div className="config-channel-grid">
            <label>
              <span>Servidor SMTP</span>
              <input value={config.email.host} onChange={(event) => onChannelConfigChange("email", "host", event.target.value)} />
            </label>
            <label>
              <span>Porta</span>
              <input
                type="number"
                value={config.email.port}
                onChange={(event) => onChannelConfigChange("email", "port", Number(event.target.value))}
              />
            </label>
            <label>
              <span>Remetente (from)</span>
              <input value={config.email.from} onChange={(event) => onChannelConfigChange("email", "from", event.target.value)} />
            </label>
          </div>
        )}

        {activeTab === "sms" && (
          <div className="config-channel-grid">
            <label>
              <span>Provedor SMS</span>
              <input value={config.sms.provider} onChange={(event) => onChannelConfigChange("sms", "provider", event.target.value)} />
            </label>
            <label>
              <span>Token / API key</span>
              <input value={config.sms.token} onChange={(event) => onChannelConfigChange("sms", "token", event.target.value)} />
            </label>
          </div>
        )}

        {activeTab === "push" && (
          <div className="config-channel-grid">
            <label>
              <span>Provedor Push</span>
              <input value={config.push.provider} onChange={(event) => onChannelConfigChange("push", "provider", event.target.value)} />
            </label>
            <label>
              <span>API key</span>
              <input value={config.push.apiKey} onChange={(event) => onChannelConfigChange("push", "apiKey", event.target.value)} />
            </label>
          </div>
        )}
      </div>
    </section>
  );
}

function SlaSection({
  settings,
  onWorkingHoursChange,
  onRuleChange,
  onSave,
}: {
  settings: SlaSettings;
  onWorkingHoursChange: (field: "start" | "end" | "weekDays", value: string | boolean) => void;
  onRuleChange: (
    priority: SlaRule["priority"],
    field: "responseTime" | "responseUnit" | "resolutionTime" | "resolutionUnit",
    value: string,
  ) => void;
  onSave: () => void;
}) {
  return (
    <section className="config-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Atendimento</p>
          <h3>Regras de SLA</h3>
        </div>
      </div>
      <div className="config-sla-card">
        <div className="config-sla-hours">
          <label>
            <span>De</span>
            <input type="time" value={settings.workingHours.start} onChange={(event) => onWorkingHoursChange("start", event.target.value)} />
          </label>
          <label>
            <span>Até</span>
            <input type="time" value={settings.workingHours.end} onChange={(event) => onWorkingHoursChange("end", event.target.value)} />
          </label>
          <label className="config-modal-toggle">
            <input
              type="checkbox"
              checked={settings.workingHours.weekDays}
              onChange={(event) => onWorkingHoursChange("weekDays", event.target.checked)}
            />
            <span>Segunda a sexta</span>
          </label>
        </div>

        <div className="config-sla-grid">
          {settings.rules.map((rule) => (
            <div key={rule.priority} className="config-sla-rule">
              <h4>Prioridade: {rule.priority}</h4>
              <div className="config-sla-inputs">
                <label>
                  <span>1ª resposta</span>
                  <input
                    type="number"
                    value={rule.responseTime}
                    onChange={(event) => onRuleChange(rule.priority, "responseTime", event.target.value)}
                  />
                </label>
                <select value={rule.responseUnit} onChange={(event) => onRuleChange(rule.priority, "responseUnit", event.target.value)}>
                  <option value="min">Minutos</option>
                  <option value="h">Horas</option>
                  <option value="d">Dias</option>
                </select>
                <label>
                  <span>Solução</span>
                  <input
                    type="number"
                    value={rule.resolutionTime}
                    onChange={(event) => onRuleChange(rule.priority, "resolutionTime", event.target.value)}
                  />
                </label>
                <select value={rule.resolutionUnit} onChange={(event) => onRuleChange(rule.priority, "resolutionUnit", event.target.value)}>
                  <option value="min">Minutos</option>
                  <option value="h">Horas</option>
                  <option value="d">Dias</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="config-form-actions">
          <button type="button" className="primary-button" onClick={onSave}>
            Salvar regras de SLA
          </button>
        </div>
      </div>
    </section>
  );
}

function SystemConfigSection({
  modules,
  onModuleToggle,
  viewPermissions,
  onChangeViewPermission,
  onSaveViewPermission,
}: {
  modules: ModuleToggle[];
  onModuleToggle: (moduleId: string) => void;
  viewPermissions: Record<string, string>;
  onChangeViewPermission: (key: string, value: string) => void;
  onSaveViewPermission: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <div className="config-system-grid">
      <section className="config-card">
        <header>
          <h4>Módulos da aplicação</h4>
          <p>Ative ou desative recursos do tenant.</p>
        </header>
        <div className="config-toggle-list">
          {modules.map((module) => (
            <div key={module.id} className="config-toggle-row">
              <div>
                <strong>{module.label}</strong>
                <p className="muted">{module.description}</p>
              </div>
              <button
                type="button"
                className={`config-switch ${module.enabled ? "is-on" : ""}`}
                onClick={() => onModuleToggle(module.id)}
                aria-pressed={module.enabled}
              >
                <span />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="config-card">
        <header>
          <h4>Campos de visão padrão (JBP)</h4>
          <p>Defina quem enxerga campos sensíveis por padrão.</p>
        </header>
        <form className="config-form-grid" onSubmit={onSaveViewPermission}>
          {(Object.keys(viewFieldLabels) as (keyof typeof viewFieldLabels)[]).map((fieldKey) => (
            <label key={fieldKey} className="config-form-field">
              <span>{viewFieldLabels[fieldKey]}</span>
              <select value={viewPermissions[fieldKey] ?? ""} onChange={(event) => onChangeViewPermission(fieldKey, event.target.value)}>
                {viewFieldOptions[fieldKey].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className="config-form-actions">
            <button type="submit" className="primary-button">
              Salvar configurações
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function IntegrationSection({
  apiKeys,
  onGenerateKey,
  onRevokeKey,
  webhooks,
  onAddWebhook,
  onToggleWebhook,
}: {
  apiKeys: ApiKey[];
  onGenerateKey: () => void;
  onRevokeKey: (keyId: string) => void;
  webhooks: WebhookEndpoint[];
  onAddWebhook: () => void;
  onToggleWebhook: (webhookId: string) => void;
}) {
  return (
    <section className="config-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Integrações</p>
          <h3>Integrações & API</h3>
        </div>
        <button type="button" className="primary-button" onClick={onGenerateKey}>
          Gerar nova chave
        </button>
      </div>
      <div className="config-table-wrapper">
        <table className="config-table">
          <thead>
            <tr>
              <th>Identificação</th>
              <th>Chave (mascarada)</th>
              <th>Criada em</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id}>
                <td>{key.label}</td>
                <td className="font-mono text-sm">{key.mask}</td>
                <td>{key.createdAt}</td>
                <td className="config-actions">
                  <button type="button" className="ghost-button" onClick={() => onRevokeKey(key.id)}>
                    Revogar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!apiKeys.length && <div className="config-empty-state">Nenhuma chave ativa.</div>}
      </div>

      <div className="config-card">
        <div className="config-card-header">
          <div>
            <h4>Webhooks (Web Service)</h4>
            <p>Envie eventos da Nexus para sistemas externos.</p>
          </div>
          <button type="button" className="primary-button" onClick={onAddWebhook}>
            Novo webhook
          </button>
        </div>
        <ul className="config-table-list">
          {webhooks.map((webhook) => (
            <li key={webhook.id}>
              <div>
                <strong>Evento: {webhook.event}</strong>
                <p className="font-mono text-xs">{webhook.url}</p>
              </div>
              <div className="config-actions">
                <button type="button" className="ghost-button" onClick={() => onToggleWebhook(webhook.id)}>
                  {webhook.active ? "Desativar" : "Ativar"}
                </button>
                <button type="button" className="ghost-button">Logs</button>
              </div>
            </li>
          ))}
        </ul>
        {!webhooks.length && <div className="config-empty-state">Nenhum webhook configurado.</div>}
      </div>
    </section>
  );
}

function AuditLogSection({ entries }: { entries: AuditEntry[] }) {
  const labelByType: Record<AuditEntry["type"], string> = {
    LOGIN: "LOGIN",
    UPLOAD: "UPLOAD",
    EDICAO: "EDIÇÃO",
  };

  return (
    <section className="config-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Auditoria</p>
          <h3>Log de atividades do tenant</h3>
        </div>
      </div>
      <div className="config-table-wrapper">
        <table className="config-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.timestamp}</td>
                <td>{entry.user}</td>
                <td>
                  <span className={`config-badge badge-${entry.type.toLowerCase()}`}>{labelByType[entry.type]}</span>
                </td>
                <td>{entry.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries.length && <div className="config-empty-state">Sem eventos registrados.</div>}
      </div>
    </section>
  );
}

function UserModal({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: UserPayload) => void;
  initialData: UserRecord | null;
}) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [role, setRole] = useState<UserRecord["role"]>(initialData?.role ?? "Administrador");
  const [status, setStatus] = useState<UserStatus>(initialData?.status ?? "Ativo");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      id: initialData?.id,
      nome,
      email,
      role,
      status,
      password: password || undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="config-modal-backdrop" role="dialog" aria-modal="true">
      <div className="config-modal">
        <header>
          <h3>{initialData ? "Editar usuário" : "Adicionar novo usuário"}</h3>
          <p className="muted">Preencha os dados para liberar ou atualizar um acesso.</p>
        </header>
        <form className="config-modal-form" onSubmit={handleSubmit}>
          <label>
            <span>Nome completo</span>
            <input value={nome} onChange={(event) => setNome(event.target.value)} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            <span>Função (Grupo)</span>
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="Administrador">Administrador</option>
              <option value="Gerente de Trade">Gerente de Trade</option>
              <option value="Analista de Dados">Analista de Dados</option>
              <option value="Assistente de Trade">Assistente de Trade</option>
              <option value="Visitante">Visitante</option>
            </select>
          </label>
          <label className="config-modal-toggle">
            <input type="checkbox" checked={status === "Ativo"} onChange={(event) => setStatus(event.target.checked ? "Ativo" : "Inativo")} />
            <span>Usuário ativo</span>
          </label>
          {!initialData && (
            <label>
              <span>Senha provisória</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
            </label>
          )}
          <div className="config-modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              {initialData ? "Salvar alterações" : "Criar usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordModal({
  user,
  open,
  onClose,
  onReset,
}: {
  user: UserRecord;
  open: boolean;
  onClose: () => void;
  onReset: () => void;
}) {
  if (!open) return null;

  return (
    <div className="config-modal-backdrop" role="dialog" aria-modal="true">
      <div className="config-modal">
        <header>
          <h3>Resetar senha</h3>
          <p className="muted">Enviar link de redefinição para {user.email}.</p>
        </header>
        <div className="config-modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="primary-button" onClick={onReset}>
            Enviar reset
          </button>
        </div>
      </div>
    </div>
  );
}
