const modules = [
  {
    title: "INICIO / GERAL",
    icon: "🏠",
    expanded: true,
    active: true,
    submodules: [
      { label: "Dashboard", href: "/dashboard", icon: "📊", active: true },
      { label: "Minhas Atividades", href: "/atividades", icon: "🗂️" },
      { label: "Calendario", href: "/calendario", icon: "🗓️" },
      { label: "Lembretes", href: "/lembretes", icon: "⏰" },
    ],
  },
  {
    title: "VENDAS",
    icon: "🎯",
    expanded: true,
    submodules: [
      { label: "Painel do modulo", href: "/vendas", icon: "📊" },
      { label: "Leads / Prospects", href: "/vendas/leads", icon: "🧲" },
      { label: "Oportunidades / Funil", href: "/vendas/oportunidades", icon: "📈" },
      { label: "Contas e Contatos", href: "/vendas/contatos", icon: "👥" },
      { label: "Produtos e Catalogo", href: "/vendas/produtos", icon: "📦" },
    ],
  },
  {
    title: "MARKETING",
    icon: "📢",
    expanded: true,
    submodules: [
      { label: "Painel do modulo", href: "/marketing", icon: "📊" },
      { label: "Campanhas", href: "/marketing/campanhas", icon: "🎬" },
      { label: "Segmentacao", href: "/marketing/segmentacao", icon: "🧩" },
    ],
  },
  {
    title: "SOLUCOES",
    icon: "🧱",
    expanded: true,
    submodules: [
      { label: "Trade Marketing", href: "/solucoes/trade", icon: "🛒" },
      { label: "Atendimento", href: "/solucoes/atendimento", icon: "🎧" },
    ],
  },
  {
    title: "AUTOMACAO",
    icon: "⚙️",
    expanded: true,
    submodules: [
      { label: "Workflows (Fluxos)", href: "/automacao/workflows", icon: "🔁" },
      { label: "Gatilhos de Dados", href: "/automacao/gatilhos", icon: "🎯" },
      { label: "Templates de E-mail", href: "/automacao/templates", icon: "✉️" },
    ],
  },
  {
    title: "AREA DE DADOS",
    icon: "🔗",
    expanded: true,
    submodules: [
      { label: "Estudio SQL", href: "/dados/estudio-sql", icon: "🧠" },
      { label: "Relatorios e BI", href: "/area-de-dados/relatorios-bi", icon: "📈" },
      { label: "Metadados (Objetos)", href: "/area-de-dados/metadados-objetos", icon: "🗂️" },
    ],
  },
];

const userMenuLinks = [
  { label: "Configuracoes", href: "/perfil/configuracoes", icon: "⚙️" },
  { label: "Tenant Admin", href: "/tenant-admin", icon: "👑" },
  { label: "Centro de Ajuda", href: "/ajuda", icon: "❓" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">N</div>
        <div>
          <strong>NEXUS CRM</strong>
          <p>Console multi-tenants</p>
        </div>
      </div>
      <div className="sidebar-section navigation">
        {modules.map((module) => (
          <div key={module.title} className="module-group">
            <div className={`module-title ${module.active ? "is-active" : ""}`}>
              <span aria-hidden="true">{module.icon}</span>
              <strong>{module.title}</strong>
              <span className="module-arrow" aria-hidden="true">
                {module.expanded ? "▾" : "▸"}
              </span>
            </div>
            <ul>
              {module.submodules.map((sub) => (
                <li key={sub.label}>
                  <a href={sub.href} className={sub.active ? "is-active" : ""}>
                    <span className="submodule-icon" aria-hidden="true">
                      {sub.icon}
                    </span>
                    <span>{sub.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-menu">
          <div className="user-profile">
            <span className="avatar">AH</span>
            <div>
              <strong>Aline Husni</strong>
              <p className="muted">Admin • tenant_lima</p>
            </div>
          </div>
          <ul>
            {userMenuLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>
                  <span aria-hidden="true">{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <button className="ghost-button logout-button">Logout</button>
        </div>
      </div>
    </aside>
  );
}
