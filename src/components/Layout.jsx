import { useState } from 'react';
import { useApp } from '../context/AppContext';

const MENU = {
  administrador: [
    { section: 'General' },
    { key: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { section: 'Administración' },
    { key: 'usuarios', icon: 'bi-people', label: 'Gestión de Usuarios' },
    { key: 'maquinaria', icon: 'bi-gear-wide-connected', label: 'Catálogo Maquinaria' },
    { section: 'Monitoreo' },
    { key: 'incidencias', icon: 'bi-exclamation-triangle', label: 'Incidencias' },
    { key: 'alertas', icon: 'bi-bell', label: 'Alertas' },
  ],
  supervisor: [
    { section: 'General' },
    { key: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { section: 'Operaciones' },
    { key: 'maquinaria', icon: 'bi-gear-wide-connected', label: 'Estado Maquinaria' },
    { key: 'checklists', icon: 'bi-clipboard-check', label: 'Configurar Checklists' },
    { key: 'incidencias', icon: 'bi-exclamation-triangle', label: 'Gestión Incidencias' },
    { section: 'Análisis' },
    { key: 'historial', icon: 'bi-clock-history', label: 'Historial de Fallas' },
    { key: 'metricas', icon: 'bi-bar-chart-line', label: 'Métricas' },
    { key: 'alertas', icon: 'bi-bell', label: 'Alertas' },
  ],
  operario: [
    { section: 'Mi Trabajo' },
    { key: 'buscar', icon: 'bi-search', label: 'Buscar Máquina' },
    { key: 'checklist-exec', icon: 'bi-clipboard-check', label: 'Ejecutar Checklist' },
    { key: 'reportar', icon: 'bi-flag', label: 'Reportar Incidencia' },
    { section: 'Mis Registros' },
    { key: 'mis-registros', icon: 'bi-journal-text', label: 'Mis Registros' },
  ],
};

export default function Layout({ vista, setVista, children }) {
  const { usuario, logout, alertasNoLeidas } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = MENU[usuario?.rol] || [];
  const initials = usuario?.nombre?.split(' ').map(w => w[0]).slice(0, 2).join('') || '?';

  return (
    <>
      {/* Sidebar */}
      <aside className={`ff-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="ff-sidebar-brand d-flex align-items-center gap-2">
          <div>
            <div className="logo-text">FixFlow</div>
            <div className="logo-sub">Gestión de Mantenimiento</div>
          </div>
        </div>

        <nav className="pt-2 pb-4">
          {items.map((item, i) => {
            if (item.section) return <div key={i} className="ff-nav-section">{item.section}</div>;
            const isAlerts = item.key === 'alertas';
            return (
              <button key={item.key} className={`ff-nav-link ${vista === item.key ? 'active' : ''}`}
                onClick={() => { setVista(item.key); setSidebarOpen(false); }}>
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
                {isAlerts && alertasNoLeidas > 0 && (
                  <span className="badge bg-danger ms-auto" style={{ fontSize: '0.65rem' }}>{alertasNoLeidas}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="ff-avatar">{initials}</div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>{usuario?.nombre}</div>
              <span className={`ff-role-badge ff-role-${usuario?.rol}`}>{usuario?.rol}</span>
            </div>
          </div>
          <button className="ff-nav-link w-100 mt-1" style={{ color: '#fca5a5' }} onClick={logout}>
            <i className="bi bi-box-arrow-left" /><span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Topbar */}
      <header className="ff-topbar">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary d-md-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="bi bi-list" />
          </button>
          <span className="ff-topbar-title">
            {items.find(i => i.key === vista)?.label || 'FixFlow'}
          </span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setVista('alertas')}>
              <i className="bi bi-bell" />
              {alertasNoLeidas > 0 && <span className="ff-alert-dot" />}
            </button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="ff-avatar">{initials}</div>
            <div className="d-none d-md-block">
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f2340' }}>{usuario?.nombre}</div>
              <span className={`ff-role-badge ff-role-${usuario?.rol}`}>{usuario?.rol}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ff-main">
        <div className="ff-content">{children}</div>
      </main>

      {sidebarOpen && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none" style={{ zIndex: 999 }} onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
