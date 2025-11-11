const modules = [
  {
    title: "Início / Geral",
    icon: "🏠",
    expanded: true,
    active: true,
    submodules: [
      { label: "Dashboard", href: "/dashboard", icon: "📊", active: true },
      { label: "Minhas atividades", href: "/atividades", icon: "🗓️" },
      { label: "Calendário", href: "/calendario", icon: "🕒" },
      { label: "Lembretes", href: "/lembretes", icon: "🔔" },
    ],
  },
  {
    title: "Vendas",
    icon: "🎯",
    expanded: true,
    submodules: [
      { label: "Oportunidades / Funil", href: "/vendas/oportunidades", icon: "📈" },
      { label: "Leads / Prospects", href: "/vendas/leads", icon: "🧭" },
      { label: "Contas e Contatos", href: "/vendas/contatos", icon: "📇" },
      { label: "Produtos e Catálogo", href: "/vendas/produtos", icon: "🛒" },
    ],
  },
  {
    title: "Marketing",
    icon: "📢",
    expanded: true,
    submodules: [
      { label: "Campanhas", href: "/marketing/campanhas", icon: "🎬" },
      { label: "Segmentação", href: "/marketing/segmentacao", icon: "🧮" },
      { label: "Automação", href: "/marketing/automacao", icon: "🤖" },
    ],
  },
  {
    title: "Soluções",
    icon: "🧩",
    expanded: true,
    submodules: [
      { label: "Trade Marketing / Logística", href: "/solucoes/trade", icon: "🚚" },
      { label: "Atendimento / Suporte", href: "/solucoes/atendimento", icon: "🎧" },
    ],
  },
  {
    title: "Área de Dados",
    icon: "🔗",
    expanded: true,
    submodules: [
      { label: "Estúdio SQL", href: "/dados", icon: "🧠" },
      { label: "Relatórios e BI", href: "/relatorios", icon: "📊" },
      { label: "Metadados (Objetos)", href: "/metadados", icon: "🗂️" },
    ],
  },
  {
    title: "Configurações / Admin",
    icon: "⚙️",
    expanded: true,
    submodules: [
      { label: "Tenant Admin", href: "/tenant-admin", icon: "🛡️" },
      { label: "Configurações de Vendas", href: "/configuracoes/vendas", icon: "🧾" },
    ],
  },
];

const supportLinks = [
  { label: "Centro de ajuda", href: "/ajuda", icon: "🛠️" },
  { label: "Perfil do usuário", href: "/perfil", icon: "👤" },
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
            <div
              className={`module-title ${module.active ? "is-active" : ""}`}
            >
              <span aria-hidden="true">{module.icon}</span>
              <strong>{module.title}</strong>
              <span className="module-arrow" aria-hidden="true">
                {module.expanded ? "▼" : "▶"}
              </span>
            </div>
            <ul>
              {module.submodules.map((sub) => (
                <li key={sub.label}>
                  <a href={sub.href} className={sub.active ? "is-active" : ""}>
                    <span>{sub.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="sidebar-section support">
        <p className="eyebrow">Suporte & Acesso</p>
        <ul>
          {supportLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href}>
                <span aria-hidden="true">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar-footer">
        <div className="user-profile">
          <span className="avatar">AH</span>
          <div>
            <strong>Aline Husni</strong>
            <p className="muted">Admin · tenant_lima</p>
          </div>
        </div>
        <button className="ghost-button logout-button">Logout</button>
      </div>
    </aside>
  );
}
