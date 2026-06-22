import { useApp } from '../../context/AppContext';

const tipoInfo = {
  CRITICA:    { color: '#ef4444', bg: '#fef2f2', icon: 'bi-shield-exclamation', label: 'Crítica' },
  PREVENTIVA: { color: '#f97316', bg: '#fff7ed', icon: 'bi-tools',              label: 'Mantenimiento' },
  INFORMATIVA:{ color: '#0ea5e9', bg: '#f0f9ff', icon: 'bi-info-circle',        label: 'Informativa' },
};

export default function AlertPanel() {
  const { alertas, marcarAlertaLeida, alertasNoLeidas } = useApp();

  const marcarTodas = () => alertas.forEach(a => { if (a.estado === 'ENVIADA') marcarAlertaLeida(a.id); });

  const criticas    = alertas.filter(a => a.tipo === 'CRITICA').length;
  const preventivas = alertas.filter(a => a.tipo === 'PREVENTIVA').length;

  return (
    <div>
      <div className="ff-page-header d-flex justify-content-between align-items-start">
        <div>
          <h4><i className="bi bi-bell me-2" style={{ color: 'var(--ff-orange)' }} />Panel de Alertas</h4>
          <p>Notificaciones del sistema de mantenimiento</p>
        </div>
        {alertasNoLeidas > 0 && (
          <button className="btn btn-outline-secondary btn-sm" onClick={marcarTodas}>
            <i className="bi bi-check-all me-1" />Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="row g-3 mb-4">
        {[['bi-bell-fill', alertasNoLeidas, 'Sin leer', '#ef4444'], ['bi-shield-exclamation', criticas, 'Críticas', '#ef4444'], ['bi-tools', preventivas, 'Mantenimiento', '#f97316'], ['bi-list-check', alertas.length, 'Total', '#0ea5e9']].map(([icon, val, lbl, color]) => (
          <div key={lbl} className="col-6 col-md-3">
            <div className="ff-stat-card">
              <div className="ff-stat-icon" style={{ background: color + '15', color }}><i className={`bi ${icon}`} /></div>
              <div><div className="ff-stat-value">{val}</div><div className="ff-stat-label">Alertas {lbl}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {['CRITICA', 'PREVENTIVA', 'INFORMATIVA'].map(tipo => {
          const info = tipoInfo[tipo];
          const grupo = alertas.filter(a => a.tipo === tipo);
          if (grupo.length === 0) return null;
          return (
            <div key={tipo} className="col-12">
              <div className="ff-card">
                <div className="ff-card-header d-flex align-items-center gap-2">
                  <i className={`bi ${info.icon}`} style={{ color: info.color }} />
                  <span>Alertas {info.label}</span>
                  <span className="badge ms-2" style={{ background: info.color, fontSize: '0.65rem' }}>{grupo.length}</span>
                </div>
                <div className="p-3">
                  {grupo.map(alerta => (
                    <div key={alerta.id} className={`ff-alert-item ${alerta.tipo.toLowerCase()} rounded mb-2 d-flex align-items-start gap-3`}
                      style={{ opacity: alerta.estado === 'LEIDA' ? 0.65 : 1 }}>
                      <div style={{ color: info.color, fontSize: '1.2rem', flexShrink: 0 }}>
                        <i className={`bi ${info.icon}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{alerta.mensaje}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                          <i className="bi bi-gear me-1" />{alerta.maquinaria}
                          <span className="mx-2">·</span>
                          <i className="bi bi-calendar me-1" />{alerta.fechaEnvio}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        <span className={`badge ${alerta.estado === 'ENVIADA' ? 'bg-danger' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                          {alerta.estado === 'ENVIADA' ? 'No leída' : 'Leída'}
                        </span>
                        {alerta.estado === 'ENVIADA' && (
                          <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.7rem' }} onClick={() => marcarAlertaLeida(alerta.id)}>
                            <i className="bi bi-check" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {alertas.length === 0 && (
          <div className="col-12"><div className="ff-empty"><i className="bi bi-bell-slash" />Sin alertas registradas</div></div>
        )}
      </div>
    </div>
  );
}
