import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';

const ESTADO_LABELS = { ABIERTA: 'Abiertas', EN_PROCESO: 'En Proceso', RESUELTA: 'Resueltas' };
const PRIORIDAD_LABELS = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', CRITICA: 'Crítica' };
const PRIORIDAD_COLOR = { BAJA: '#3b82f6', MEDIA: '#f59e0b', ALTA: '#f97316', CRITICA: '#ef4444' };
const ESTADO_COLOR = { ABIERTA: '#ef4444', EN_PROCESO: '#eab308', RESUELTA: '#22c55e' };

function countByKey(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'Desconocido';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function formatLabel(label) {
  return label.replace('_', ' ').toUpperCase();
}

export default function Reportes() {
  const { incidencias } = useApp();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGenerate = () => {
    const err = {};
    if (!desde) err.desde = 'Seleccione fecha de inicio.';
    if (!hasta) err.hasta = 'Seleccione fecha de fin.';
    if (desde && hasta && new Date(desde) > new Date(hasta)) {
      err.hasta = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    }
    setErrors(err);
    if (Object.keys(err).length > 0) {
      setReportGenerated(false);
      return;
    }
    setReportGenerated(true);
  };

  const filteredIncidencias = useMemo(() => {
    if (!reportGenerated || !desde || !hasta) return [];
    const start = new Date(desde);
    const end = new Date(hasta);
    end.setHours(23, 59, 59, 999);
    return incidencias.filter((inc) => {
      const fecha = new Date(inc.fechaRegistro);
      return fecha >= start && fecha <= end;
    });
  }, [reportGenerated, desde, hasta, incidencias]);

  const estadoCounts = useMemo(() => countByKey(filteredIncidencias, 'estado'), [filteredIncidencias]);
  const prioridadCounts = useMemo(() => countByKey(filteredIncidencias, 'prioridad'), [filteredIncidencias]);
  const maquinaCounts = useMemo(() => countByKey(filteredIncidencias, 'maquinariaNombre'), [filteredIncidencias]);

  const topMaquinas = useMemo(
    () => Object.entries(maquinaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    [maquinaCounts]
  );

  const totalIncidencias = filteredIncidencias.length;

  return (
    <div>
      <div className="ff-page-header">
        <h4><i className="bi bi-bar-chart-line me-2" style={{ color: 'var(--ff-orange)' }} />Reportes Operativos</h4>
        <p>Analice el estado general de la maquinaria y las incidencias por periodo seleccionado.</p>
      </div>

      <div className="ff-card mb-4">
        <div className="ff-card-header">Periodo del Reporte</div>
        <div className="p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="ff-form-label">Desde</label>
              <input
                type="date"
                className={`form-control ${errors.desde ? 'is-invalid' : ''}`}
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
              {errors.desde && <div className="invalid-feedback">{errors.desde}</div>}
            </div>

            <div className="col-md-4">
              <label className="ff-form-label">Hasta</label>
              <input
                type="date"
                className={`form-control ${errors.hasta ? 'is-invalid' : ''}`}
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
              {errors.hasta && <div className="invalid-feedback">{errors.hasta}</div>}
            </div>

            <div className="col-md-4">
              <button className="btn btn-ff-primary w-100" onClick={handleGenerate}>
                <i className="bi bi-graph-up me-1" /> Generar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      {reportGenerated && (
        <>
          {totalIncidencias === 0 ? (
            <div className="ff-card">
              <div className="ff-empty"><i className="bi bi-info-circle" /> No hay información disponible para el periodo seleccionado.</div>
            </div>
          ) : (
            <>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="ff-stat-card">
                    <div className="ff-stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}><i className="bi bi-exclamation-circle" /></div>
                    <div>
                      <div className="ff-stat-value">{totalIncidencias}</div>
                      <div className="ff-stat-label">Incidencias Totales</div>
                    </div>
                  </div>
                </div>
                {Object.entries(ESTADO_LABELS).map(([key, label]) => (
                  <div key={key} className="col-md-4">
                    <div className="ff-stat-card">
                      <div className="ff-stat-icon" style={{ background: ESTADO_COLOR[key] + '20', color: ESTADO_COLOR[key] }}><i className="bi bi-clipboard-check" /></div>
                      <div>
                        <div className="ff-stat-value">{estadoCounts[key] || 0}</div>
                        <div className="ff-stat-label">Incidencias {label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row g-3 mb-4">
                {Object.entries(PRIORIDAD_LABELS).map(([key, label]) => (
                  <div key={key} className="col-md-3">
                    <div className="ff-stat-card">
                      <div className="ff-stat-icon" style={{ background: PRIORIDAD_COLOR[key] + '20', color: PRIORIDAD_COLOR[key] }}><i className="bi bi-flag" /></div>
                      <div>
                        <div className="ff-stat-value">{prioridadCounts[key] || 0}</div>
                        <div className="ff-stat-label">Prioridad {label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="ff-card h-100">
                    <div className="ff-card-header">Incidencias por Máquina</div>
                    <div className="p-3">
                      <table className="table ff-table mb-0">
                        <thead><tr><th>Máquina</th><th className="text-end">Incidencias</th></tr></thead>
                        <tbody>
                          {topMaquinas.map(([maquina, cantidad]) => (
                            <tr key={maquina}>
                              <td><small>{maquina}</small></td>
                              <td className="text-end"><strong>{cantidad}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="ff-card h-100">
                    <div className="ff-card-header">Detalle de Incidencias</div>
                    <div className="p-3">
                      {filteredIncidencias.slice(0, 5).map((inc) => (
                        <div key={inc.id} className="mb-3">
                          <div className="d-flex justify-content-between">
                            <strong>{inc.codigo}</strong>
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>{inc.fechaRegistro}</span>
                          </div>
                          <div className="d-flex gap-2 flex-wrap mt-1" style={{ fontSize: '0.78rem' }}>
                            <span className="badge bg-secondary">{inc.maquinariaNombre}</span>
                            <span className="badge" style={{ background: PRIORIDAD_COLOR[inc.prioridad] + '20', color: PRIORIDAD_COLOR[inc.prioridad] }}>{inc.prioridad}</span>
                            <span className="badge" style={{ background: ESTADO_COLOR[inc.estado] + '20', color: ESTADO_COLOR[inc.estado] }}>{formatLabel(inc.estado)}</span>
                          </div>
                          <p className="mb-0 mt-2" style={{ fontSize: '0.85rem', color: '#475569' }}>{inc.descripcion.length > 80 ? inc.descripcion.substring(0, 80) + '...' : inc.descripcion}</p>
                        </div>
                      ))}
                      {filteredIncidencias.length > 5 && <div className="text-muted" style={{ fontSize: '0.82rem' }}>Mostrando las 5 incidencias más recientes del periodo.</div>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
