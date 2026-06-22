import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const TIPOS = ['Corrugadora', 'Ranuradora', 'Paletizadora', 'Línea Continua', 'Otro'];

function ChecklistModal({ onClose, onSave }) {
  const [nombre, setNombre] = useState('');
  const [tipoMaquina, setTipoMaquina] = useState('Corrugadora');
  const [items, setItems] = useState([{ id: Date.now(), tarea: '', obligatorio: true, orden: 1 }]);
  const [error, setError] = useState('');

  const addItem = () => setItems(p => [...p, { id: Date.now(), tarea: '', obligatorio: true, orden: p.length + 1 }]);
  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id, k, v) => setItems(p => p.map(i => i.id === id ? { ...i, [k]: v } : i));

  const handlePublish = () => {
    if (!nombre.trim()) { setError('Ingrese un nombre para el checklist.'); return; }
    const validItems = items.filter(i => i.tarea.trim());
    if (validItems.length === 0) { setError('Debe agregar al menos una tarea antes de publicar el checklist.'); return; }
    onSave({ nombre, tipoMaquina, items: validItems.map((it, idx) => ({ ...it, orden: idx + 1 })) });
  };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--ff-navy)', color: '#fff' }}>
            <h5 className="modal-title"><i className="bi bi-clipboard-plus me-2" />Constructor de Checklist</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-1" /><small>{error}</small></div>}
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <label className="ff-form-label">Nombre del checklist *</label>
                <input className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Mantenimiento Preventivo Corrugadora" />
              </div>
              <div className="col-md-4">
                <label className="ff-form-label">Tipo de máquina *</label>
                <select className="form-select" value={tipoMaquina} onChange={e => setTipoMaquina(e.target.value)}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="ff-form-label mb-0">Tareas de inspección</label>
              <button className="btn btn-sm btn-outline-primary" onClick={addItem}><i className="bi bi-plus-lg me-1" />Agregar tarea</button>
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {items.map((item, idx) => (
                <div key={item.id} className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-secondary" style={{ minWidth: 24 }}>{idx + 1}</span>
                  <input className="form-control" value={item.tarea} onChange={e => updateItem(item.id, 'tarea', e.target.value)}
                    placeholder={`Tarea ${idx + 1}...`} />
                  <div className="form-check form-switch mb-0 d-flex align-items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
                    <input className="form-check-input" type="checkbox" checked={item.obligatorio}
                      onChange={e => updateItem(item.id, 'obligatorio', e.target.checked)} id={`obl-${item.id}`} />
                    <label className="form-check-label" htmlFor={`obl-${item.id}`} style={{ fontSize: '0.75rem' }}>Obligatoria</label>
                  </div>
                  {items.length > 1 && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item.id)}><i className="bi bi-trash" /></button>
                  )}
                </div>
              ))}
            </div>

            <div className="alert alert-info mt-3 py-2">
              <small><i className="bi bi-info-circle me-1" />Este checklist estará disponible para todas las máquinas del tipo <strong>{tipoMaquina}</strong> al publicarlo.</small>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-ff-primary" onClick={handlePublish}><i className="bi bi-send me-1" />Publicar Checklist</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistBuilder() {
  const { checklists, agregarChecklist } = useApp();
  const [modal, setModal] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState('');

  const handleSave = (data) => {
    agregarChecklist(data);
    setModal(false);
    setToast(`Checklist "${data.nombre}" publicado exitosamente.`);
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <div>
      <div className="ff-page-header d-flex justify-content-between align-items-start">
        <div>
          <h4><i className="bi bi-clipboard-check me-2" style={{ color: 'var(--ff-orange)' }} />Configuración de Checklists</h4>
          <p>Cree y gestione listas de verificación por tipo de máquina</p>
        </div>
        <button className="btn btn-ff-primary" onClick={() => setModal(true)}>
          <i className="bi bi-plus-circle me-1" />Nuevo Checklist
        </button>
      </div>

      {toast && <div className="alert alert-success py-2 mb-3"><i className="bi bi-check-circle-fill me-2" /><small>{toast}</small></div>}

      <div className="row g-3">
        {checklists.map(ck => (
          <div key={ck.id} className="col-md-6">
            <div className="ff-card">
              <div className="p-3">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <div className="fw-bold" style={{ color: 'var(--ff-navy)' }}>{ck.nombre}</div>
                    <small className="text-muted"><i className="bi bi-gear me-1" />{ck.tipoMaquina}</small>
                  </div>
                  <span className={`badge ${ck.estado ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.68rem' }}>
                    {ck.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="d-flex gap-3 mb-2" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  <span><i className="bi bi-list-check me-1" />{ck.items.length} tareas</span>
                  <span><i className="bi bi-exclamation-circle me-1" />{ck.items.filter(i => i.obligatorio).length} obligatorias</span>
                  <span><i className="bi bi-calendar me-1" />{ck.fechaCreacion}</span>
                </div>
                <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setExpanded(expanded === ck.id ? null : ck.id)}>
                  <i className={`bi bi-chevron-${expanded === ck.id ? 'up' : 'down'} me-1`} />
                  {expanded === ck.id ? 'Ocultar tareas' : 'Ver tareas'}
                </button>

                {expanded === ck.id && (
                  <div className="mt-3">
                    {ck.items.map((item, idx) => (
                      <div key={item.id || idx} className="ff-checklist-item pendiente mb-2">
                        <span className="badge bg-secondary me-1">{item.orden}</span>
                        <span style={{ fontSize: '0.83rem', flex: 1 }}>{item.tarea}</span>
                        {item.obligatorio && <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>Obligatoria</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {checklists.length === 0 && (
          <div className="col-12"><div className="ff-empty"><i className="bi bi-clipboard" />No hay checklists configurados</div></div>
        )}
      </div>

      {modal && <ChecklistModal onClose={() => setModal(false)} onSave={handleSave} />}
    </div>
  );
}
