import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';

const CATEGORIAS = ['Mecánica', 'Eléctrica', 'Hidráulica', 'Neumática', 'Electrónica', 'Estructural', 'Otro'];
const PRIORIDADES = [
  { val: 'BAJA',    label: 'Baja',    color: '#3b82f6', desc: 'No afecta la producción inmediata' },
  { val: 'MEDIA',   label: 'Media',   color: '#eab308', desc: 'Reducción parcial de capacidad' },
  { val: 'ALTA',    label: 'Alta',    color: '#f97316', desc: 'Afecta producción significativamente' },
  { val: 'CRITICA', label: 'Crítica', color: '#ef4444', desc: 'Parada total de línea de producción' },
];

export default function IncidentReport() {
  const { maquinaria, agregarIncidencia, usuario } = useApp();
  const [form, setForm] = useState({ maquinariaId: '', categoria: '', descripcion: '', prioridad: '' });
  const [foto, setFoto] = useState(null);
  const [errores, setErrores] = useState({});
  const [done, setDone] = useState(null);
  const fileRef = useRef();

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrores(p => ({ ...p, [k]: '' })); };

  const maquina = maquinaria.find(m => m.id === form.maquinariaId);

  const handleFoto = (e) => {
    const f = e.target.files[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setFoto({ file: f, url });
      setErrores(p => ({ ...p, foto: '' }));
    }
  };

  const validate = () => {
    const err = {};
    if (!form.maquinariaId) err.maquinariaId = 'Seleccione una máquina.';
    if (!form.categoria) err.categoria = 'Seleccione una categoría.';
    if (!form.descripcion.trim() || form.descripcion.length < 10) err.descripcion = 'La descripción debe tener al menos 10 caracteres.';
    if (!form.prioridad) err.prioridad = 'Seleccione la prioridad.';
    if (!foto) err.foto = 'Adjunte una fotografía de la falla detectada.';
    return err;
  };

  const handleSubmit = () => {
    const err = validate();
    if (Object.keys(err).length > 0) { setErrores(err); return; }
    const nueva = { ...form, maquinariaNombre: maquina.nombre, evidenciaUrl: foto.url, reportadoPor: usuario.nombre };
    agregarIncidencia(nueva);
    setDone(nueva);
  };

  const reset = () => { setForm({ maquinariaId: '', categoria: '', descripcion: '', prioridad: '' }); setFoto(null); setErrores({}); setDone(null); };

  if (done) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center" style={{ maxWidth: 480 }}>
          <div style={{ fontSize: '4rem', color: '#22c55e' }}><i className="bi bi-check-circle-fill" /></div>
          <h4 className="mt-3 fw-bold" style={{ color: 'var(--ff-navy)' }}>Incidencia Reportada</h4>
          <p className="text-muted">El reporte fue enviado correctamente y se generó un ticket de seguimiento.</p>
          {done.prioridad === 'CRITICA' && (
            <div className="alert alert-danger py-2 mb-3">
              <i className="bi bi-bell-fill me-1" /><small><strong>Alerta crítica enviada</strong> al supervisor de turno.</small>
            </div>
          )}
          <div className="ff-card p-3 mb-4 text-start">
            <div style={{ fontSize: '0.82rem' }}>
              {[['Máquina', maquina?.nombre], ['Categoría', done.categoria], ['Prioridad', done.prioridad], ['Estado', 'ABIERTA'], ['Reportado por', done.reportadoPor], ['Fecha', new Date().toLocaleDateString('es-PE')]].map(([k, v]) => (
                <div key={k} className="mb-1"><strong>{k}:</strong> {v}</div>
              ))}
            </div>
          </div>
          <button className="btn btn-ff-primary w-100" onClick={reset}><i className="bi bi-flag me-1" />Reportar Otra Incidencia</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ff-page-header">
        <h4><i className="bi bi-flag me-2" style={{ color: 'var(--ff-orange)' }} />Reportar Incidencia</h4>
        <p>Documente fallas detectadas para notificar al área encargada</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="ff-card">
            <div className="ff-card-header"><i className="bi bi-exclamation-circle me-2" />Datos de la Incidencia</div>
            <div className="p-4">
              {/* Máquina */}
              <div className="mb-4">
                <label className="ff-form-label">Máquina afectada *</label>
                <select className={`form-select ${errores.maquinariaId ? 'is-invalid' : ''}`} value={form.maquinariaId} onChange={e => set('maquinariaId', e.target.value)}>
                  <option value="">-- Seleccione la máquina --</option>
                  {maquinaria.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.codigoUnico})</option>)}
                </select>
                {errores.maquinariaId && <div className="invalid-feedback">{errores.maquinariaId}</div>}
                {maquina && (
                  <div className="mt-2 p-2 bg-light rounded d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-geo-alt text-muted" />{maquina.linea} · {maquina.ubicacion}
                    <span className={`badge ms-auto ${maquina.estado === 'Operativa' ? 'bg-success' : maquina.estado === 'En Mantenimiento' ? 'bg-warning text-dark' : 'bg-danger'}`}>{maquina.estado}</span>
                  </div>
                )}
              </div>

              {/* Categoría */}
              <div className="mb-4">
                <label className="ff-form-label">Categoría de falla *</label>
                <div className="d-flex flex-wrap gap-2">
                  {CATEGORIAS.map(cat => (
                    <button key={cat} type="button" className={`btn btn-sm ${form.categoria === cat ? 'btn-ff-navy' : 'btn-outline-secondary'}`}
                      onClick={() => set('categoria', cat)}>{cat}</button>
                  ))}
                </div>
                {errores.categoria && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errores.categoria}</div>}
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="ff-form-label">Descripción de la falla *</label>
                <textarea className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`} rows={4}
                  value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                  placeholder="Describa detalladamente la falla detectada: síntomas, comportamiento anormal, momento de aparición..." />
                {errores.descripcion && <div className="invalid-feedback">{errores.descripcion}</div>}
                <div className="form-text">{form.descripcion.length}/500 caracteres</div>
              </div>

              {/* Prioridad */}
              <div className="mb-4">
                <label className="ff-form-label">Nivel de prioridad *</label>
                <div className="row g-2">
                  {PRIORIDADES.map(p => (
                    <div key={p.val} className="col-6 col-md-3">
                      <div className={`p-2 rounded border text-center cursor-pointer ${form.prioridad === p.val ? 'border-2' : 'border-light'}`}
                        style={{ cursor: 'pointer', borderColor: form.prioridad === p.val ? p.color : undefined, background: form.prioridad === p.val ? p.color + '15' : '#f8fafc' }}
                        onClick={() => set('prioridad', p.val)}>
                        <div className="fw-bold" style={{ color: p.color, fontSize: '0.85rem' }}>{p.label}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {errores.prioridad && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errores.prioridad}</div>}
              </div>

              {/* Foto */}
              <div className="mb-4">
                <label className="ff-form-label">Evidencia fotográfica *</label>
                <div className={`ff-photo-upload ${errores.foto ? 'border-danger' : ''}`} onClick={() => fileRef.current.click()}>
                  {foto ? (
                    <div>
                      <img src={foto.url} alt="evidencia" className="ff-photo-preview w-100" />
                      <p className="mt-2 mb-0" style={{ fontSize: '0.8rem', color: '#64748b' }}>{foto.file.name} · Clic para cambiar</p>
                    </div>
                  ) : (
                    <div>
                      <i className="bi bi-camera" style={{ fontSize: '2rem', color: '#94a3b8' }} />
                      <p className="mt-2 mb-0" style={{ color: '#64748b', fontSize: '0.85rem' }}>Haga clic para adjuntar fotografía</p>
                      <small className="text-muted">JPG, PNG o WEBP (máx. 10 MB)</small>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileRef} accept="image/*" className="d-none" onChange={handleFoto} />
                {errores.foto && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errores.foto}</div>}
              </div>

              {Object.keys(errores).length > 0 && !Object.values(errores).every(v => !v) && (
                <div className="alert alert-danger py-2">
                  <i className="bi bi-exclamation-circle me-1" /><small>Complete todos los campos obligatorios antes de enviar el reporte.</small>
                </div>
              )}

              <button className="btn btn-ff-primary w-100 py-2" onClick={handleSubmit}>
                <i className="bi bi-send me-2" />Enviar Reporte de Incidencia
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="ff-card">
            <div className="ff-card-header"><i className="bi bi-info-circle me-2" />Guía de Reporte</div>
            <div className="p-3">
              {[['Seleccione la máquina', 'Identifique el equipo con falla usando su nombre o código único.'],
                ['Categorice la falla', 'Clasifique según el sistema afectado: mecánico, eléctrico, etc.'],
                ['Describa con detalle', 'Incluya cuándo inició, síntomas observados y comportamiento anormal.'],
                ['Defina la prioridad', 'Evalúe el impacto en la producción para asignar la urgencia correcta.'],
                ['Adjunte evidencia', 'Una fotografía clara de la falla ayuda al equipo técnico a prepararse.'],
              ].map(([tit, desc], i) => (
                <div key={i} className="d-flex gap-3 mb-3">
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--ff-orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div><div className="fw-semibold" style={{ fontSize: '0.82rem' }}>{tit}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
