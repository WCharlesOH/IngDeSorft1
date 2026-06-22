import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MachineDetail from './MachineDetail';

const TIPOS = ['Corrugadora', 'Ranuradora', 'Paletizadora', 'Línea Continua', 'Otro'];
const LINEAS = ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'];
const NAVES = ['Nave A', 'Nave B', 'Nave C', 'Nave D'];

const TIPO_ICON = { Corrugadora: 'bi-gear-wide-connected', Ranuradora: 'bi-scissors', Paletizadora: 'bi-boxes', 'Línea Continua': 'bi-arrow-repeat', Otro: 'bi-tools' };

function MachineFormModal({ machine, onClose, onSave }) {
  const { maquinaria } = useApp();
  const [form, setForm] = useState(machine || { nombre: '', linea: 'Línea 1', tipo: 'Corrugadora', ubicacion: 'Nave A' });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.nombre || !form.linea || !form.tipo || !form.ubicacion) { setError('Complete todos los campos.'); return; }
    const dup = maquinaria.find(m => m.nombre.toLowerCase() === form.nombre.toLowerCase() && m.id !== form.id);
    if (dup) { setError('Ya existe una máquina registrada con ese nombre en el sistema.'); return; }
    onSave(form);
  };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--ff-navy)', color: '#fff' }}>
            <h5 className="modal-title"><i className="bi bi-gear-wide-connected me-2" />{machine ? 'Editar Maquinaria' : 'Registrar Maquinaria'}</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2"><small>{error}</small></div>}
            <div className="row g-3">
              <div className="col-12">
                <label className="ff-form-label">Nombre de la máquina *</label>
                <input className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej. Corrugadora Principal A" />
              </div>
              <div className="col-md-6">
                <label className="ff-form-label">Tipo de máquina *</label>
                <select className="form-select" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="ff-form-label">Línea de producción *</label>
                <select className="form-select" value={form.linea} onChange={e => set('linea', e.target.value)}>
                  {LINEAS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="ff-form-label">Ubicación / Nave *</label>
                <select className="form-select" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)}>
                  {NAVES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              {machine && (
                <div className="col-md-6">
                  <label className="ff-form-label">Estado operativo</label>
                  <select className="form-select" value={form.estado} onChange={e => set('estado', e.target.value)}>
                    {['Operativa', 'En Mantenimiento', 'Con Falla'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
            {!machine && (
              <div className="alert alert-info mt-3 py-2">
                <small><i className="bi bi-info-circle me-1" />El código único será generado automáticamente al guardar.</small>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-ff-primary" onClick={handleSave}>
              <i className="bi bi-check-lg me-1" />{machine ? 'Guardar Cambios' : 'Registrar Máquina'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchModal({ onClose, onSelect }) {
  const { maquinaria } = useApp();
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const buscar = () => {
    const m = maquinaria.find(x => x.codigoUnico.toLowerCase() === codigo.toLowerCase());
    if (m) { setResultado(m); setNotFound(false); }
    else { setResultado(null); setNotFound(true); }
  };

  const stateColor = { 'Operativa': '#22c55e', 'En Mantenimiento': '#eab308', 'Con Falla': '#ef4444' };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--ff-navy)', color: '#fff' }}>
            <h5 className="modal-title"><i className="bi bi-search me-2" />Identificar Maquinaria por Código</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            <label className="ff-form-label">Código único de la máquina</label>
            <div className="input-group mb-3">
              <input className="form-control" placeholder="Ej. FF-2024-001" value={codigo} onChange={e => setCodigo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscar()} />
              <button className="btn btn-ff-primary" onClick={buscar}><i className="bi bi-search" /></button>
            </div>

            {notFound && (
              <div className="alert alert-warning py-2">
                <i className="bi bi-exclamation-triangle me-1" />
                <small>No se encontró ninguna máquina con ese código. Verifique e intente nuevamente.</small>
              </div>
            )}

            {resultado && (
              <div className="ff-card">
                <div className="p-3">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="ff-stat-icon blue" style={{ width: 48, height: 48 }}>
                      <i className={`bi ${TIPO_ICON[resultado.tipo] || 'bi-gear'}`} />
                    </div>
                    <div>
                      <div className="fw-bold" style={{ color: 'var(--ff-navy)' }}>{resultado.nombre}</div>
                      <code style={{ fontSize: '0.78rem' }}>{resultado.codigoUnico}</code>
                    </div>
                  </div>
                  <div className="row g-2" style={{ fontSize: '0.82rem' }}>
                    {[['Tipo', resultado.tipo], ['Línea', resultado.linea], ['Ubicación', resultado.ubicacion]].map(([k, v]) => (
                      <div key={k} className="col-4"><span className="text-muted">{k}:</span><br /><strong>{v}</strong></div>
                    ))}
                  </div>
                  <hr />
                  <div className="d-flex align-items-center justify-content-between">
                    <span style={{ fontSize: '0.82rem' }}>Estado actual:</span>
                    <span className="ff-status-badge" style={{ background: stateColor[resultado.estado] + '20', color: stateColor[resultado.estado], border: `1px solid ${stateColor[resultado.estado]}40` }}>
                      <span className="ff-status-dot" style={{ background: stateColor[resultado.estado] }} />{resultado.estado}
                    </span>
                  </div>
                  <button className="btn btn-ff-navy w-100 mt-3" onClick={() => { onSelect(resultado); onClose(); }}>
                    <i className="bi bi-arrow-right-circle me-1" />Ver Ficha Completa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MachineCatalog({ rol, maquinaInicial, setVista }) {
  const { maquinaria, agregarMaquina, editarMaquina, usuario } = useApp();
  const [selected, setSelected] = useState(maquinaInicial || null);
  const [modal, setModal] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (selected) return <MachineDetail maquina={selected} onBack={() => setSelected(null)} setVista={setVista} />;

  const handleSave = (form) => {
    if (form.id) { editarMaquina(form.id, form); showToast('Máquina actualizada correctamente.'); }
    else { agregarMaquina(form); showToast('Máquina registrada. Código único generado automáticamente.'); }
    setModal(null);
  };

  const filtered = maquinaria.filter(m => {
    const q = search.toLowerCase();
    return (m.nombre.toLowerCase().includes(q) || m.codigoUnico.toLowerCase().includes(q))
      && (!filtroEstado || m.estado === filtroEstado)
      && (!filtroTipo || m.tipo === filtroTipo);
  });

  const stateColor = { 'Operativa': 'success', 'En Mantenimiento': 'warning', 'Con Falla': 'danger' };
  const canEdit = usuario?.rol === 'administrador';

  return (
    <div>
      <div className="ff-page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h4><i className="bi bi-gear-wide-connected me-2" style={{ color: 'var(--ff-orange)' }} />Catálogo de Maquinaria</h4>
          <p>Inventario de activos industriales de CARVIMSA</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => setShowSearch(true)}>
            <i className="bi bi-search me-1" />Buscar por Código
          </button>
          {canEdit && (
            <button className="btn btn-ff-primary" onClick={() => setModal({})}>
              <i className="bi bi-plus-circle me-1" />Nueva Máquina
            </button>
          )}
        </div>
      </div>

      {toast && <div className="alert alert-success py-2 mb-3"><i className="bi bi-check-circle-fill me-2" /><small>{toast}</small></div>}

      {/* Filters */}
      <div className="ff-card mb-3 p-3">
        <div className="d-flex gap-3 flex-wrap align-items-center">
          <div className="input-group" style={{ maxWidth: 280 }}>
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input className="form-control" placeholder="Nombre o código..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ maxWidth: 180 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {['Operativa', 'En Mantenimiento', 'Con Falla'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ maxWidth: 180 }} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS.map(t => <option key={t}>{t}</option>)}
          </select>
          <span className="text-muted ms-auto" style={{ fontSize: '0.8rem' }}>{filtered.length} máquina{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="row g-3">
        {filtered.map(m => (
          <div key={m.id} className="col-sm-6 col-lg-4">
            <div className="ff-machine-card" onClick={() => setSelected(m)}>
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div className="ff-stat-icon blue" style={{ width: 44, height: 44, borderRadius: 10 }}>
                  <i className={`bi ${TIPO_ICON[m.tipo] || 'bi-gear'}`} style={{ fontSize: '1.2rem' }} />
                </div>
                <span className={`badge bg-${stateColor[m.estado]}-subtle text-${stateColor[m.estado]} border border-${stateColor[m.estado]}-subtle`} style={{ fontSize: '0.7rem' }}>
                  {m.estado}
                </span>
              </div>
              <div className="fw-bold mb-1" style={{ color: 'var(--ff-navy)', fontSize: '0.9rem' }}>{m.nombre}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}>
                <i className="bi bi-upc me-1" /><code>{m.codigoUnico}</code>
              </div>
              <div className="d-flex gap-3" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                <span><i className="bi bi-diagram-3 me-1" />{m.linea}</span>
                <span><i className="bi bi-geo-alt me-1" />{m.ubicacion}</span>
              </div>
              {canEdit && (
                <button className="btn btn-sm btn-outline-secondary mt-2 w-100" onClick={e => { e.stopPropagation(); setModal(m); }}>
                  <i className="bi bi-pencil me-1" />Editar
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-12"><div className="ff-empty"><i className="bi bi-gear-wide-connected" />No se encontraron máquinas</div></div>
        )}
      </div>

      {modal !== null && <MachineFormModal machine={modal?.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} onSelect={m => { setSelected(m); setShowSearch(false); }} />}
    </div>
  );
}
