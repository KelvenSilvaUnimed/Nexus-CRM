import Sidebar from "./Sidebar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <header className="app-shell-header">
          <div className="header-brand">
            <span className="logo-mark">⟳</span>
            <div>
              <p className="eyebrow">Nexus CRM</p>
              <strong>Console multi-tenants</strong>
            </div>
          </div>
          <div className="header-actions">
            <label className="search-field">
              <span className="sr-only">Buscar</span>
              <input placeholder="Buscar deals, objetos e objetos customizados" />
            </label>
            <button className="icon-button" aria-label="Notificações">
              🔔
              <span className="notification-dot" />
            </button>
            <button className="icon-button" aria-label="Perfil">
              👤
            </button>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}

