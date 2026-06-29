import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const ESTADOS = ['ABIERTA', 'EN_PROCESO', 'RESUELTA'];
const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
const prioColor = { BAJA: '#3b82f6', MEDIA: '#eab308', ALTA: '#f97316', CRITICA: '#ef4444' };
const stateColor = { ABIERTA: '#ef4444', EN_PROCESO: '#eab308', RESUELTA: '#22c55e' };

function IncidentModal({ incidencia, onClose, onUpdate }) {
  const [estado, setEstado] = useState(incidencia.estado);
  const [comentario, setComentario] = useState(incidencia.comentarioTecnico || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (estado === 'RESUELTA' && !comentario.trim()) {
      setError('Debe ingresar un comentario técnico antes de marcar la incidencia como resuelta.');
      return;
    }
    onUpdate(incidencia.id, { estado, comentarioTecnico: comentario });
    onClose();
  };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--ff-navy)', color: '#fff' }}>
            <h5 className="modal-title"><i className="bi bi-wrench me-2" />Gestionar Incidencia · {incidencia.codigo}</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2"><small>{error}</small></div>}
            <div className="row g-3 mb-4">
              <div className="col-md-6"><strong>Máquina:</strong><br /><span style={{ fontSize: '0.88rem' }}>{incidencia.maquinariaNombre}</span></div>
              <div className="col-md-6"><strong>Categoría:</strong><br /><span style={{ fontSize: '0.88rem' }}>{incidencia.categoria}</span></div>
              <div className="col-md-6"><strong>Prioridad:</strong><br /><span className="ff-status-badge" style={{ background: prioColor[incidencia.prioridad] + '20', color: prioColor[incidencia.prioridad], fontSize: '0.82rem' }}>{incidencia.prioridad}</span></div>
              <div className="col-md-6"><strong>Fecha Registro:</strong><br /><span style={{ fontSize: '0.88rem' }}>{incidencia.fechaRegistro}</span></div>
              <div className="col-12">
                <strong>Descripción:</strong>
                <p className="mt-1 p-3 bg-light rounded" style={{ fontSize: '0.88rem' }}>{incidencia.descripcion}</p>
              </div>
              <div className="col-md-6">
                <label className="ff-form-label">Cambiar estado</label>
                <div className="d-flex gap-2 flex-wrap">
                  {ESTADOS.map(s => (
                    <button key={s} className={`btn btn-sm ${estado === s ? 'btn-ff-primary' : 'btn-outline-secondary'}`}
                      onClick={() => { setEstado(s); setError(''); }}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-12">
                <label className="ff-form-label">Comentario técnico {estado === 'RESUELTA' ? '*' : '(opcional)'}</label>
                <textarea className="form-control" rows={3} value={comentario} onChange={e => { setComentario(e.target.value); setError(''); }}
                  placeholder="Descripción de la acción tomada, repuestos usados, diagnóstico..." />
              </div>
              {estado === 'RESUELTA' && (
                <div className="col-12">
                  <div className="alert alert-success py-2">
                    <i className="bi bi-check-circle me-1" /><small>Al marcar como <strong>Resuelta</strong>, la máquina volverá al estado <strong>Operativa</strong> automáticamente.</small>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-ff-primary" onClick={handleSave}><i className="bi bi-check-lg me-1" />Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncidentList({ mostrarHistorial = false }) {
  const { incidencias, actualizarIncidencia, usuario } = useApp();
  const [selected, setSelected] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrio, setFiltroPrio] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const canManage = usuario?.rol === 'supervisor' || usuario?.rol === 'administrador';

  const handleUpdate = (id, data) => {
    actualizarIncidencia(id, data);
    setToast('Incidencia actualizada correctamente.');
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = incidencias.filter(i => {
    if (mostrarHistorial && i.estado !== 'RESUELTA') return false;
    const q = search.toLowerCase();
    return (i.maquinariaNombre.toLowerCase().includes(q) || (i.codigo ?? '').toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q))
      && (!filtroEstado || i.estado === filtroEstado)
      && (!filtroPrio || i.prioridad === filtroPrio);
  });

  const abiertas   = incidencias.filter(i => i.estado === 'ABIERTA').length;
  const enProceso  = incidencias.filter(i => i.estado === 'EN_PROCESO').length;
  const resueltas  = incidencias.filter(i => i.estado === 'RESUELTA').length;

  return (
    <div>
      <div className="ff-page-header">
        <h4>
          <i className={`bi bi-${mostrarHistorial ? 'clock-history' : 'exclamation-triangle'} me-2`} style={{ color: 'var(--ff-orange)' }} />
          {mostrarHistorial ? 'Historial de Fallas' : 'Gestión de Incidencias'}
        </h4>
        <p>{mostrarHistorial ? 'Consulte el registro histórico de fallas resueltas' : 'Monitoree y gestione el ciclo de vida de las incidencias'}</p>
      </div>

      {toast && <div className="alert alert-success py-2 mb-3"><i className="bi bi-check-circle-fill me-2" /><small>{toast}</small></div>}

      {!mostrarHistorial && (
        <div className="row g-3 mb-4">
          {[['bi-exclamation-circle', abiertas, 'Abiertas', '#ef4444'], ['bi-clock', enProceso, 'En Proceso', '#eab308'], ['bi-check-circle', resueltas, 'Resueltas', '#22c55e']].map(([icon, val, lbl, color]) => (
            <div key={lbl} className="col-md-4">
              <div className="ff-stat-card" style={{ cursor: 'pointer' }} onClick={() => setFiltroEstado(lbl === filtroEstado ? '' : lbl.toUpperCase().replace(' ', '_'))}>
                <div className="ff-stat-icon" style={{ background: color + '20', color }}><i className={`bi ${icon}`} /></div>
                <div><div className="ff-stat-value">{val}</div><div className="ff-stat-label">Incidencias {lbl}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ff-card mb-3 p-3">
        <div className="d-flex gap-3 flex-wrap align-items-center">
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input className="form-control" placeholder="ID, máquina o descripción..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {!mostrarHistorial && (
            <select className="form-select" style={{ maxWidth: 160 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {ESTADOS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          )}
          <select className="form-select" style={{ maxWidth: 160 }} value={filtroPrio} onChange={e => setFiltroPrio(e.target.value)}>
            <option value="">Todas las prioridades</option>
            {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
          </select>
          <span className="ms-auto text-muted" style={{ fontSize: '0.8rem' }}>{filtered.length} incidencia{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="ff-card">
        <table className="table ff-table mb-0">
          <thead>
            <tr><th>ID</th><th>Máquina</th><th>Categoría</th><th>Descripción</th><th>Prioridad</th><th>Estado</th><th>Fecha</th><th>Reportado por</th>{canManage && !mostrarHistorial && <th>Acciones</th>}</tr>
          </thead>
          <tbody>
            {filtered.map(inc => (
              <tr key={inc.id}>
                <td><code style={{ fontSize: '0.75rem' }}>{inc.codigo}</code></td>
                <td><small className="fw-semibold">{inc.maquinariaNombre}</small></td>
                <td><small>{inc.categoria}</small></td>
                <td>
                  <small>{inc.descripcion.length > 50 ? inc.descripcion.substring(0, 50) + '...' : inc.descripcion}</small>
                  {inc.comentarioTecnico && (
                    <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: 2 }}>
                      <i className="bi bi-check-circle me-1" />{inc.comentarioTecnico.substring(0, 40)}...
                    </div>
                  )}
                </td>
                <td>
                  <span className="ff-status-badge" style={{ background: prioColor[inc.prioridad] + '20', color: prioColor[inc.prioridad] }}>
                    <span className="ff-status-dot" style={{ background: prioColor[inc.prioridad] }} />{inc.prioridad}
                  </span>
                </td>
                <td>
                  <span className="ff-status-badge" style={{ background: stateColor[inc.estado] + '20', color: stateColor[inc.estado] }}>
                    <span className="ff-status-dot" style={{ background: stateColor[inc.estado] }} />{inc.estado.replace('_', ' ')}
                  </span>
                </td>
                <td><small className="text-muted">{inc.fechaRegistro}</small></td>
                <td><small>{inc.reportadoPor}</small></td>
                {canManage && !mostrarHistorial && (
                  <td>
                    {inc.estado !== 'RESUELTA' && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelected(inc)}>
                        <i className="bi bi-pencil-square me-1" />Gestionar
                      </button>
                    )}
                    {inc.estado === 'RESUELTA' && <span className="text-muted" style={{ fontSize: '0.75rem' }}>Cerrada</span>}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9}><div className="ff-empty"><i className="bi bi-check-circle" />{mostrarHistorial ? 'Sin fallas en el historial' : 'No se encontraron incidencias'}</div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <IncidentModal incidencia={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
