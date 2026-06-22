import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ChecklistExecution() {
  const { maquinaria, checklists, agregarRegistro, usuario } = useApp();
  const [step, setStep] = useState(1);
  const [maquinaId, setMaquinaId] = useState('');
  const [checklistId, setChecklistId] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [errores, setErrores] = useState([]);
  const [done, setDone] = useState(false);

  const maquina = maquinaria.find(m => m.id === maquinaId);
  const checklist = checklists.find(c => c.id === checklistId);
  const ckParaMaquina = maquina ? checklists.filter(c => c.tipoMaquina === maquina.tipo && c.estado) : [];

  const setRespuesta = (itemId, valor) => setRespuestas(p => ({ ...p, [itemId]: valor }));

  const handleFinalize = () => {
    if (!checklist) return;
    const pendientes = checklist.items.filter(i => i.obligatorio && !respuestas[i.id]);
    if (pendientes.length > 0) {
      setErrores(pendientes.map(i => i.id));
      return;
    }
    setErrores([]);
    const items = checklist.items.map(i => ({ ...i, resultado: respuestas[i.id] || 'pendiente' }));
    const conforme = items.every(i => i.resultado !== 'no_cumple');
    agregarRegistro({
      maquinariaId: maquinaId, checklistId,
      usuario: usuario.nombre, items,
      resultadoGeneral: conforme ? 'Conforme' : 'No Conforme',
      observaciones, firmaDigital: `${usuario.nombre.split(' ').map(w => w[0]).join('')}-${Date.now()}`,
    });
    setDone(true);
  };

  const reset = () => { setStep(1); setMaquinaId(''); setChecklistId(''); setRespuestas({}); setObservaciones(''); setErrores([]); setDone(false); };

  if (done) {
    const items = checklist.items.map(i => ({ ...i, resultado: respuestas[i.id] || 'pendiente' }));
    const conforme = items.every(i => i.resultado !== 'no_cumple');
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center" style={{ maxWidth: 480 }}>
          <div style={{ fontSize: '4rem', color: conforme ? '#22c55e' : '#ef4444' }}>
            <i className={`bi bi-${conforme ? 'check-circle-fill' : 'exclamation-triangle-fill'}`} />
          </div>
          <h4 className="mt-3 fw-bold" style={{ color: 'var(--ff-navy)' }}>
            {conforme ? 'Mantenimiento Completado' : 'Mantenimiento con Observaciones'}
          </h4>
          <p className="text-muted">
            {conforme ? 'Todos los ítems se cumplieron correctamente. El estado de la máquina fue actualizado.' : 'Se detectaron ítems no conformes. La máquina fue marcada como En Mantenimiento.'}
          </p>
          <div className="ff-card p-3 mb-4 text-start">
            <div style={{ fontSize: '0.82rem' }}>
              <div><strong>Máquina:</strong> {maquina?.nombre}</div>
              <div><strong>Checklist:</strong> {checklist?.nombre}</div>
              <div><strong>Resultado:</strong> <span className={`badge ${conforme ? 'bg-success' : 'bg-danger'}`}>{conforme ? 'Conforme' : 'No Conforme'}</span></div>
              <div><strong>Operario:</strong> {usuario?.nombre}</div>
              <div><strong>Fecha:</strong> {new Date().toLocaleDateString('es-PE')}</div>
            </div>
          </div>
          <button className="btn btn-ff-primary w-100" onClick={reset}><i className="bi bi-arrow-repeat me-1" />Nuevo Checklist</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ff-page-header">
        <h4><i className="bi bi-clipboard-check me-2" style={{ color: 'var(--ff-orange)' }} />Ejecutar Checklist</h4>
        <p>Registre formalmente el cumplimiento de la rutina de mantenimiento</p>
      </div>

      {/* Steps */}
      <div className="d-flex align-items-center gap-2 mb-4">
        {[['1', 'Seleccionar Máquina'], ['2', 'Seleccionar Checklist'], ['3', 'Ejecutar']].map(([n, lbl], i) => (
          <div key={n} className="d-flex align-items-center gap-2">
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, background: step > i ? '#22c55e' : step === i + 1 ? 'var(--ff-orange)' : '#e2e8f0', color: step >= i + 1 ? '#fff' : '#94a3b8' }}>
              {step > i + 1 ? <i className="bi bi-check" /> : n}
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--ff-navy)' : '#94a3b8' }}>{lbl}</span>
            {i < 2 && <div style={{ width: 40, height: 2, background: step > i + 1 ? '#22c55e' : '#e2e8f0' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select machine */}
      {step === 1 && (
        <div className="ff-card p-4" style={{ maxWidth: 600 }}>
          <h6 className="fw-bold mb-3" style={{ color: 'var(--ff-navy)' }}>Seleccione la máquina a mantener</h6>
          <select className="form-select mb-3" value={maquinaId} onChange={e => { setMaquinaId(e.target.value); setChecklistId(''); }}>
            <option value="">-- Seleccione una máquina --</option>
            {maquinaria.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.codigoUnico})</option>)}
          </select>
          {maquina && (
            <div className="alert alert-info py-2 mb-3">
              <div style={{ fontSize: '0.82rem' }}>
                <strong>{maquina.nombre}</strong> · {maquina.tipo} · {maquina.linea}<br />
                <span className={`badge ${maquina.estado === 'Operativa' ? 'bg-success' : maquina.estado === 'En Mantenimiento' ? 'bg-warning text-dark' : 'bg-danger'} mt-1`}>{maquina.estado}</span>
              </div>
            </div>
          )}
          <button className="btn btn-ff-primary" disabled={!maquinaId} onClick={() => setStep(2)}>
            Continuar <i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
      )}

      {/* Step 2: Select checklist */}
      {step === 2 && (
        <div className="ff-card p-4" style={{ maxWidth: 600 }}>
          <h6 className="fw-bold mb-3" style={{ color: 'var(--ff-navy)' }}>Seleccione el checklist para <em>{maquina?.nombre}</em></h6>
          {ckParaMaquina.length === 0 ? (
            <div className="alert alert-warning"><i className="bi bi-exclamation-triangle me-1" />No hay checklists disponibles para el tipo <strong>{maquina?.tipo}</strong>. Solicite al supervisor que configure uno.</div>
          ) : (
            <div className="row g-2 mb-3">
              {ckParaMaquina.map(ck => (
                <div key={ck.id} className="col-12">
                  <div className={`p-3 rounded border cursor-pointer ${checklistId === ck.id ? 'border-warning bg-warning bg-opacity-10' : 'border-light bg-light'}`}
                    style={{ cursor: 'pointer' }} onClick={() => setChecklistId(ck.id)}>
                    <div className="d-flex align-items-center gap-2">
                      <input type="radio" checked={checklistId === ck.id} onChange={() => setChecklistId(ck.id)} />
                      <div>
                        <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{ck.nombre}</div>
                        <small className="text-muted">{ck.items.length} tareas · {ck.items.filter(i => i.obligatorio).length} obligatorias</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}><i className="bi bi-arrow-left me-1" />Atrás</button>
            <button className="btn btn-ff-primary" disabled={!checklistId} onClick={() => setStep(3)}>Iniciar Ejecución <i className="bi bi-play-fill ms-1" /></button>
          </div>
        </div>
      )}

      {/* Step 3: Execute */}
      {step === 3 && checklist && (
        <div>
          <div className="ff-card mb-3 p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="ff-stat-icon orange"><i className="bi bi-clipboard-check" /></div>
              <div>
                <div className="fw-bold" style={{ color: 'var(--ff-navy)' }}>{checklist.nombre}</div>
                <small className="text-muted">Máquina: {maquina?.nombre} · {Object.keys(respuestas).length}/{checklist.items.length} respondidas</small>
              </div>
              <div className="ms-auto">
                <div className="progress" style={{ width: 100, height: 6 }}>
                  <div className="progress-bar bg-success" style={{ width: `${(Object.keys(respuestas).length / checklist.items.length) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {errores.length > 0 && (
            <div className="alert alert-danger py-2 mb-3">
              <i className="bi bi-exclamation-circle me-1" /><small>Debe completar todos los campos obligatorios antes de enviar. Los ítems pendientes están resaltados.</small>
            </div>
          )}

          <div className="ff-card mb-3">
            <div className="ff-card-header"><i className="bi bi-list-check me-2" />Ítems de Verificación</div>
            <div className="p-3">
              {checklist.items.map((item, idx) => {
                const resp = respuestas[item.id];
                const hasError = errores.includes(item.id);
                return (
                  <div key={item.id} className={`ff-checklist-item ${resp === 'cumple' ? 'cumple' : resp === 'no_cumple' ? 'no-cumple' : 'pendiente'} ${hasError ? 'border-danger' : ''} mb-2`}>
                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                      <span className="badge bg-secondary" style={{ minWidth: 24, fontSize: '0.7rem' }}>{item.orden}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.85rem' }}>{item.tarea}</span>
                        {item.obligatorio && <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.62rem' }}>Obligatoria</span>}
                        {hasError && <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>Este campo es obligatorio</div>}
                      </div>
                    </div>
                    <div className="d-flex gap-2 flex-shrink-0">
                      {[['cumple', 'Cumple', 'success'], ['no_cumple', 'No Cumple', 'danger']].map(([val, lbl, color]) => (
                        <button key={val} className={`btn btn-sm ${resp === val ? `btn-${color}` : `btn-outline-${color}`}`}
                          style={{ fontSize: '0.75rem' }} onClick={() => setRespuesta(item.id, val)}>
                          <i className={`bi bi-${val === 'cumple' ? 'check' : 'x'}-lg me-1`} />{lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ff-card p-3 mb-3">
            <label className="ff-form-label">Observaciones generales</label>
            <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Notas adicionales sobre el mantenimiento..." />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setStep(2)}><i className="bi bi-arrow-left me-1" />Atrás</button>
            <button className="btn btn-ff-primary flex-grow-1" onClick={handleFinalize}>
              <i className="bi bi-send-check me-1" />Finalizar y Registrar Mantenimiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
