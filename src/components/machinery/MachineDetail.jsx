import { useApp } from '../../context/AppContext';

const stateColor = { 'Operativa': '#22c55e', 'En Mantenimiento': '#eab308', 'Con Falla': '#ef4444' };
const incStateColor = { 'ABIERTA': '#ef4444', 'EN_PROCESO': '#eab308', 'RESUELTA': '#22c55e' };

export default function MachineDetail({ maquina, onBack, setVista }) {
  const { incidencias, registros } = useApp();

  const maqIncidencias = incidencias.filter(i => i.maquinariaId === maquina.id);
  const maqRegistros   = registros.filter(r => r.maquinariaId === maquina.id);
  const totalFallas    = maqIncidencias.length;
  const resueltas      = maqIncidencias.filter(i => i.estado === 'RESUELTA').length;
  const abiertas       = maqIncidencias.filter(i => i.estado !== 'RESUELTA').length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary" onClick={onBack}><i className="bi bi-arrow-left" /></button>
        <div>
          <h4 className="mb-0" style={{ color: 'var(--ff-navy)', fontWeight: 700 }}>{maquina.nombre}</h4>
          <small className="text-muted"><i className="bi bi-upc me-1" />{maquina.codigoUnico}</small>
        </div>
        <span className="ms-auto ff-status-badge" style={{ background: stateColor[maquina.estado] + '20', color: stateColor[maquina.estado], border: `1px solid ${stateColor[maquina.estado]}40`, fontSize: '0.85rem', padding: '6px 14px' }}>
          <span className="ff-status-dot" style={{ background: stateColor[maquina.estado], width: 8, height: 8 }} />{maquina.estado}
        </span>
      </div>

      <div className="row g-3 mb-4">
        {/* Ficha técnica */}
        <div className="col-md-4">
          <div className="ff-card h-100">
            <div className="ff-card-header"><i className="bi bi-info-circle me-2" />Ficha Técnica</div>
            <div className="p-3">
              {[['Código único', maquina.codigoUnico], ['Tipo', maquina.tipo], ['Línea de producción', maquina.linea], ['Ubicación', maquina.ubicacion], ['Registrado', maquina.fechaCreacion]].map(([k, v]) => (
                <div key={k} className="mb-3 pb-3 border-bottom">
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</div>
                  <div className="fw-semibold" style={{ fontSize: '0.88rem', color: 'var(--ff-navy)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="col-md-8">
          <div className="row g-3 mb-3">
            {[['bi-exclamation-triangle', totalFallas, 'Total Fallas', 'orange'], ['bi-check-circle', resueltas, 'Resueltas', 'green'], ['bi-clock', abiertas, 'Pendientes', 'red'], ['bi-clipboard-check', maqRegistros.length, 'Mantenimientos', 'blue']].map(([icon, val, lbl, cls]) => (
              <div key={lbl} className="col-6">
                <div className="ff-stat-card">
                  <div className={`ff-stat-icon ${cls}`}><i className={`bi ${icon}`} /></div>
                  <div><div className="ff-stat-value">{val}</div><div className="ff-stat-label">{lbl}</div></div>
                </div>
              </div>
            ))}
          </div>

          {/* Incidencias recientes */}
          <div className="ff-card">
            <div className="ff-card-header"><i className="bi bi-clock-history me-2" />Historial de Incidencias</div>
            <div className="p-0">
              {maqIncidencias.length === 0 ? (
                <div className="ff-empty"><i className="bi bi-emoji-smile" />Sin incidencias registradas</div>
              ) : (
                <table className="table ff-table mb-0">
                  <thead><tr><th>ID</th><th>Categoría</th><th>Descripción</th><th>Prioridad</th><th>Estado</th><th>Fecha</th></tr></thead>
                  <tbody>
                    {maqIncidencias.map(inc => (
                      <tr key={inc.id}>
                        <td><small className="text-muted">{inc.id}</small></td>
                        <td><small>{inc.categoria}</small></td>
                        <td><small>{inc.descripcion.substring(0, 50)}{inc.descripcion.length > 50 ? '...' : ''}</small></td>
                        <td><span className={`ff-status-badge ff-badge-${inc.prioridad.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>{inc.prioridad}</span></td>
                        <td>
                          <span className="ff-status-badge" style={{ background: incStateColor[inc.estado] + '20', color: incStateColor[inc.estado], fontSize: '0.68rem' }}>
                            {inc.estado.replace('_', ' ')}
                          </span>
                        </td>
                        <td><small className="text-muted">{inc.fechaRegistro}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registros de mantenimiento */}
      <div className="ff-card">
        <div className="ff-card-header"><i className="bi bi-clipboard-check me-2" />Registros de Mantenimiento</div>
        <div className="p-0">
          {maqRegistros.length === 0 ? (
            <div className="ff-empty"><i className="bi bi-clipboard" />Sin registros de mantenimiento</div>
          ) : (
            <table className="table ff-table mb-0">
              <thead><tr><th>ID</th><th>Fecha</th><th>Realizado por</th><th>Resultado</th><th>Observaciones</th></tr></thead>
              <tbody>
                {maqRegistros.map(r => (
                  <tr key={r.id}>
                    <td><small className="text-muted">{r.id}</small></td>
                    <td><small>{r.fechaEjecucion}</small></td>
                    <td><small>{r.usuario}</small></td>
                    <td>
                      <span className={`badge ${r.resultadoGeneral === 'Conforme' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.7rem' }}>
                        {r.resultadoGeneral}
                      </span>
                    </td>
                    <td><small className="text-muted">{r.observaciones || '—'}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
