import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const stateColor = { 'Operativa': '#22c55e', 'En Mantenimiento': '#eab308', 'Con Falla': '#ef4444' };
const incStateColor = { 'ABIERTA': '#ef4444', 'EN_PROCESO': '#eab308', 'RESUELTA': '#22c55e' };
const ESTADOS_INICIALES = ['Operativa', 'En Mantenimiento', 'Con Falla'];

// HU6: formulario de registro/edición de la ficha técnica de una máquina.
function FichaTecnicaModal({ maquina, onClose, onSave }) {
  const f = maquina.ficha;
  const [form, setForm] = useState(f ? {
    marca: f.marca, modelo: f.modelo, numeroSerie: f.numeroSerie,
    anioFabricacion: f.anioFabricacion ?? '', potencia: f.potencia, voltaje: f.voltaje,
    capacidad: f.capacidad, dimensiones: f.dimensiones, peso: f.peso,
    estadoInicial: f.estadoInicial, observaciones: f.observaciones,
  } : {
    marca: '', modelo: '', numeroSerie: '', anioFabricacion: '', potencia: '', voltaje: '',
    capacidad: '', dimensiones: '', peso: '', estadoInicial: maquina.estado || 'Operativa', observaciones: '',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.marca.trim() || !form.modelo.trim() || !String(form.numeroSerie).trim()) {
      setError('Complete los campos obligatorios: marca, modelo y número de serie.');
      return;
    }
    const anioMax = new Date().getFullYear();
    const anio = Number(form.anioFabricacion);
    if (form.anioFabricacion !== '' && (!Number.isInteger(anio) || anio < 1950 || anio > anioMax)) {
      setError(`Ingrese un año de fabricación válido (1950–${anioMax}).`);
      return;
    }
    setError('');
    setGuardando(true);
    try {
      await onSave(form);
    } catch (e) {
      console.error('Error guardando ficha técnica:', e);
      setError('No se pudo guardar la ficha técnica en el servidor. Intente nuevamente.');
      setGuardando(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--ff-navy)', color: '#fff' }}>
            <h5 className="modal-title"><i className="bi bi-file-earmark-text me-2" />{f ? 'Editar' : 'Registrar'} Ficha Técnica</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-1" /><small>{error}</small></div>}
            {!f && (
              <div className="alert alert-info py-2 mb-3">
                <small><i className="bi bi-link-45deg me-1" />La ficha se asociará a <strong>{maquina.nombre}</strong> (<code>{maquina.codigoUnico}</code>).</small>
              </div>
            )}
            <div className="row g-3">
              <div className="col-md-4">
                <label className="ff-form-label">Marca *</label>
                <input className="form-control" value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Ej. BHS Corrugated" />
              </div>
              <div className="col-md-4">
                <label className="ff-form-label">Modelo *</label>
                <input className="form-control" value={form.modelo} onChange={e => set('modelo', e.target.value)} placeholder="Ej. QF-2400" />
              </div>
              <div className="col-md-4">
                <label className="ff-form-label">Número de serie *</label>
                <input className="form-control" value={form.numeroSerie} onChange={e => set('numeroSerie', e.target.value)} placeholder="Ej. BHS-2019-08841" />
              </div>
              <div className="col-md-3">
                <label className="ff-form-label">Año de fabricación</label>
                <input type="number" className="form-control" value={form.anioFabricacion} onChange={e => set('anioFabricacion', e.target.value)} placeholder="Ej. 2019" min="1950" max={new Date().getFullYear()} />
              </div>
              <div className="col-md-3">
                <label className="ff-form-label">Potencia</label>
                <input className="form-control" value={form.potencia} onChange={e => set('potencia', e.target.value)} placeholder="Ej. 110 kW" />
              </div>
              <div className="col-md-3">
                <label className="ff-form-label">Voltaje</label>
                <input className="form-control" value={form.voltaje} onChange={e => set('voltaje', e.target.value)} placeholder="Ej. 440 V trifásico" />
              </div>
              <div className="col-md-3">
                <label className="ff-form-label">Capacidad</label>
                <input className="form-control" value={form.capacidad} onChange={e => set('capacidad', e.target.value)} placeholder="Ej. 250 m/min" />
              </div>
              <div className="col-md-4">
                <label className="ff-form-label">Dimensiones</label>
                <input className="form-control" value={form.dimensiones} onChange={e => set('dimensiones', e.target.value)} placeholder="Ej. 12.5 × 3.2 × 2.8 m" />
              </div>
              <div className="col-md-4">
                <label className="ff-form-label">Peso</label>
                <input className="form-control" value={form.peso} onChange={e => set('peso', e.target.value)} placeholder="Ej. 18 500 kg" />
              </div>
              <div className="col-md-4">
                <label className="ff-form-label">Estado inicial *</label>
                <select className="form-select" value={form.estadoInicial} onChange={e => set('estadoInicial', e.target.value)}>
                  {ESTADOS_INICIALES.map(s => <option key={s}>{s}</option>)}
                </select>
                {!f && <div className="form-text">Se aplicará como estado operativo de la máquina.</div>}
              </div>
              <div className="col-12">
                <label className="ff-form-label">Observaciones técnicas</label>
                <textarea className="form-control" rows={2} value={form.observaciones} onChange={e => set('observaciones', e.target.value)}
                  placeholder="Historial de modificaciones, repuestos críticos, condiciones especiales de operación..." />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={guardando}>Cancelar</button>
            <button className="btn btn-ff-primary" onClick={handleSave} disabled={guardando}>
              {guardando
                ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                : <><i className="bi bi-check-lg me-1" />{f ? 'Guardar Cambios' : 'Registrar Ficha Técnica'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MachineDetail({ maquina: maquinaProp, onBack }) {
  const { incidencias, registros, maquinaria, usuario, guardarFichaTecnica } = useApp();
  const [modalFicha, setModalFicha] = useState(false);
  const [toast, setToast] = useState('');

  // Usar la versión vigente desde el contexto: la prop puede quedar
  // desactualizada tras guardar la ficha técnica o cambiar el estado.
  const maquina = maquinaria.find(m => m.id === maquinaProp.id) ?? maquinaProp;
  const ficha = maquina.ficha;
  const esAdmin = usuario?.rol === 'administrador';

  const maqIncidencias = incidencias.filter(i => i.maquinariaId === maquina.id);
  const maqRegistros   = registros.filter(r => r.maquinariaId === maquina.id);
  const totalFallas    = maqIncidencias.length;
  const resueltas      = maqIncidencias.filter(i => i.estado === 'RESUELTA').length;
  const abiertas       = maqIncidencias.filter(i => i.estado !== 'RESUELTA').length;

  const handleGuardarFicha = async (form) => {
    const esNueva = !ficha;
    await guardarFichaTecnica(maquina.id, form);
    setModalFicha(false);
    setToast(esNueva ? 'Ficha técnica registrada y asociada a la máquina.' : 'Ficha técnica actualizada correctamente.');
    setTimeout(() => setToast(''), 3500);
  };

  const especificaciones = ficha ? [
    ['Marca', ficha.marca], ['Modelo', ficha.modelo], ['N° de serie', ficha.numeroSerie],
    ['Año de fabricación', ficha.anioFabricacion], ['Potencia', ficha.potencia], ['Voltaje', ficha.voltaje],
    ['Capacidad', ficha.capacidad], ['Dimensiones', ficha.dimensiones], ['Peso', ficha.peso],
    ['Estado inicial', ficha.estadoInicial], ['Ficha registrada', ficha.fechaRegistro],
  ].filter(([, v]) => v !== '' && v !== null && v !== undefined) : [];

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

      {toast && <div className="alert alert-success py-2 mb-3"><i className="bi bi-check-circle-fill me-2" /><small>{toast}</small></div>}

      <div className="row g-3 mb-4">
        {/* Ficha técnica */}
        <div className="col-md-4">
          <div className="ff-card h-100">
            <div className="ff-card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-info-circle me-2" />Ficha Técnica</span>
              {esAdmin && ficha && (
                <button className="btn btn-sm btn-outline-light" onClick={() => setModalFicha(true)}>
                  <i className="bi bi-pencil me-1" />Editar
                </button>
              )}
            </div>
            <div className="p-3">
              {[['Código único', maquina.codigoUnico], ['Tipo', maquina.tipo], ['Línea de producción', maquina.linea], ['Ubicación', maquina.ubicacion], ['Registrado', maquina.fechaCreacion]].map(([k, v]) => (
                <div key={k} className="mb-3 pb-3 border-bottom">
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</div>
                  <div className="fw-semibold" style={{ fontSize: '0.88rem', color: 'var(--ff-navy)' }}>{v}</div>
                </div>
              ))}

              {/* Especificaciones técnicas (HU6) */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ff-navy)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <i className="bi bi-file-earmark-text me-1" />Especificaciones
                </span>
                {ficha
                  ? <span className="badge bg-success" style={{ fontSize: '0.62rem' }}>Registrada</span>
                  : <span className="badge bg-warning text-dark" style={{ fontSize: '0.62rem' }}>Pendiente</span>}
              </div>

              {ficha ? (
                <>
                  {especificaciones.map(([k, v]) => (
                    <div key={k} className="mb-3 pb-3 border-bottom">
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</div>
                      <div className="fw-semibold" style={{ fontSize: '0.88rem', color: 'var(--ff-navy)' }}>{v}</div>
                    </div>
                  ))}
                  {ficha.observaciones && (
                    <div className="mb-1">
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Observaciones técnicas</div>
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>{ficha.observaciones}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-3" style={{ color: '#94a3b8' }}>
                  <i className="bi bi-file-earmark-text" style={{ fontSize: '1.6rem' }} />
                  <p className="mb-2 mt-2" style={{ fontSize: '0.8rem' }}>Esta máquina aún no tiene ficha técnica registrada.</p>
                  {esAdmin ? (
                    <button className="btn btn-sm btn-ff-primary" onClick={() => setModalFicha(true)}>
                      <i className="bi bi-plus-lg me-1" />Completar Ficha Técnica
                    </button>
                  ) : (
                    <small>Solicite al administrador completar el registro.</small>
                  )}
                </div>
              )}
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

      {modalFicha && <FichaTecnicaModal maquina={maquina} onClose={() => setModalFicha(false)} onSave={handleGuardarFicha} />}
    </div>
  );
}
