import { useApp } from '../context/AppContext';

function StatCard({ icon, value, label, colorClass, trend }) {
  return (
    <div className="ff-stat-card">
      <div className={`ff-stat-icon ${colorClass}`}><i className={`bi ${icon}`} /></div>
      <div>
        <div className="ff-stat-value">{value}</div>
        <div className="ff-stat-label">{label}</div>
        {trend && <div style={{ fontSize: '0.7rem', color: trend.up ? '#22c55e' : '#ef4444', marginTop: 2 }}>
          <i className={`bi bi-arrow-${trend.up ? 'up' : 'down'}-short`} />{trend.text}
        </div>}
      </div>
    </div>
  );
}

function MachineRow({ m, onSelect }) {
  const stateInfo = {
    'Operativa':       { cls: 'ff-badge-operativa',     dot: '#22c55e', icon: 'bi-check-circle-fill' },
    'En Mantenimiento':{ cls: 'ff-badge-mantenimiento',  dot: '#eab308', icon: 'bi-tools' },
    'Con Falla':       { cls: 'ff-badge-falla',          dot: '#ef4444', icon: 'bi-x-circle-fill' },
  }[m.estado] || {};

  return (
    <tr style={{ cursor: 'pointer' }} onClick={() => onSelect(m)}>
      <td><span className="fw-semibold" style={{ color: '#0f2340' }}>{m.nombre}</span><br /><small className="text-muted">{m.codigoUnico}</small></td>
      <td><small>{m.linea}</small></td>
      <td><small>{m.tipo}</small></td>
      <td>
        <span className={`ff-status-badge ${stateInfo.cls}`}>
          <span className="ff-status-dot" style={{ background: stateInfo.dot }} />
          {m.estado}
        </span>
      </td>
      <td><small className="text-muted">{m.ubicacion}</small></td>
    </tr>
  );
}

export default function Dashboard({ setVista, setMaquinaSeleccionada }) {
  const { maquinaria, incidencias, usuarios, alertas, usuario } = useApp();

  const operativas    = maquinaria.filter(m => m.estado === 'Operativa').length;
  const mantenimiento = maquinaria.filter(m => m.estado === 'En Mantenimiento').length;
  const conFalla      = maquinaria.filter(m => m.estado === 'Con Falla').length;
  const incAbiertas   = incidencias.filter(i => i.estado === 'ABIERTA').length;
  const incCriticas   = incidencias.filter(i => i.prioridad === 'CRITICA' && i.estado !== 'RESUELTA').length;

  const tiposFrecuentes = incidencias.reduce((acc, inc) => {
    acc[inc.categoria] = (acc[inc.categoria] || 0) + 1; return acc;
  }, {});
  const maxFrecuente = Math.max(...Object.values(tiposFrecuentes), 1);

  const recientes = [...incidencias].sort((a,b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)).slice(0, 4);

  const handleMachine = (m) => {
    if (setMaquinaSeleccionada) setMaquinaSeleccionada(m);
    setVista('maquinaria');
  };

  return (
    <div>
      <div className="ff-page-header">
        <h4><i className="bi bi-speedometer2 me-2" style={{ color: 'var(--ff-orange)' }} />Dashboard Operativo</h4>
        <p>Estado general de la planta CARVIMSA · {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><StatCard icon="bi-gear-wide-connected" value={maquinaria.length} label="Total Máquinas" colorClass="blue" /></div>
        <div className="col-6 col-md-3"><StatCard icon="bi-check-circle" value={operativas} label="Operativas" colorClass="green" /></div>
        <div className="col-6 col-md-3"><StatCard icon="bi-exclamation-triangle" value={incAbiertas} label="Incidencias Abiertas" colorClass="orange" /></div>
        <div className="col-6 col-md-3"><StatCard icon="bi-shield-exclamation" value={incCriticas} label="Fallas Críticas" colorClass="red" /></div>
      </div>

      <div className="row g-3 mb-4">
        {/* Machine status overview */}
        <div className="col-md-8">
          <div className="ff-card h-100">
            <div className="ff-card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-gear-wide-connected me-2" />Estado de Maquinaria</span>
              {(usuario?.rol === 'administrador' || usuario?.rol === 'supervisor') && (
                <button className="btn btn-sm btn-outline-light" onClick={() => setVista('maquinaria')}>Ver todo</button>
              )}
            </div>
            <div className="p-0">
              <table className="table ff-table mb-0">
                <thead><tr><th>Máquina</th><th>Línea</th><th>Tipo</th><th>Estado</th><th>Ubicación</th></tr></thead>
                <tbody>
                  {maquinaria.map(m => <MachineRow key={m.id} m={m} onSelect={handleMachine} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-md-4">
          {/* Resumen estados */}
          <div className="ff-card mb-3">
            <div className="ff-card-header"><i className="bi bi-pie-chart me-2" />Distribución de Estado</div>
            <div className="p-3">
              {[['Operativas', operativas, '#22c55e'], ['En Mantenimiento', mantenimiento, '#eab308'], ['Con Falla', conFalla, '#ef4444']].map(([lbl, val, color]) => (
                <div key={lbl} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="fw-semibold">{lbl}</small><small className="fw-bold">{val}</small>
                  </div>
                  <div className="progress ff-progress-bar-custom">
                    <div className="progress-bar" style={{ width: `${maquinaria.length ? (val/maquinaria.length)*100 : 0}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas recientes */}
          <div className="ff-card">
            <div className="ff-card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-bell me-2" />Alertas Recientes</span>
              <button className="btn btn-sm btn-outline-light" onClick={() => setVista('alertas')}>Ver todas</button>
            </div>
            <div className="p-2">
              {alertas.slice(0, 3).map(a => (
                <div key={a.id} className={`ff-alert-item mb-1 rounded ${a.tipo.toLowerCase()}`}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{a.tipo}</div>
                  <div style={{ fontSize: '0.75rem', color: '#374151' }}>{a.mensaje.substring(0, 70)}...</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{a.fechaEnvio}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent incidents + fallas frecuentes */}
      <div className="row g-3">
        <div className="col-md-7">
          <div className="ff-card">
            <div className="ff-card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-exclamation-triangle me-2" />Incidencias Recientes</span>
              <button className="btn btn-sm btn-outline-light" onClick={() => setVista('incidencias')}>Ver todas</button>
            </div>
            <div className="p-0">
              <table className="table ff-table mb-0">
                <thead><tr><th>ID</th><th>Máquina</th><th>Categoría</th><th>Prioridad</th><th>Estado</th></tr></thead>
                <tbody>
                  {recientes.map(inc => (
                    <tr key={inc.id}>
                      <td><small className="text-muted">{inc.id}</small></td>
                      <td><small>{inc.maquinariaNombre}</small></td>
                      <td><small>{inc.categoria}</small></td>
                      <td><span className={`ff-status-badge ff-badge-${inc.prioridad.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>{inc.prioridad}</span></td>
                      <td><span className={`ff-status-badge ff-badge-${inc.estado.toLowerCase().replace('_','-')}`} style={{ fontSize: '0.68rem' }}>{inc.estado.replace('_',' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="ff-card h-100">
            <div className="ff-card-header"><i className="bi bi-bar-chart-line me-2" />Fallas por Categoría</div>
            <div className="p-3">
              {Object.entries(tiposFrecuentes).map(([cat, cnt]) => (
                <div key={cat} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="fw-semibold">{cat}</small><small className="fw-bold text-danger">{cnt}</small>
                  </div>
                  <div className="progress ff-progress-bar-custom">
                    <div className="progress-bar bg-danger" style={{ width: `${(cnt/maxFrecuente)*100}%` }} />
                  </div>
                </div>
              ))}
              {Object.keys(tiposFrecuentes).length === 0 && <div className="ff-empty"><i className="bi bi-emoji-smile" />Sin fallas registradas</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
