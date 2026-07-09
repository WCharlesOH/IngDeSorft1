import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AlertSettings() {
  const { alertSettings, guardarConfiguracionAlertas } = useApp();
  const [settings, setSettings] = useState(alertSettings);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setSettings(alertSettings);
  }, [alertSettings]);

  const handleChange = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!settings.criticas && !settings.informativas) {
      const confirmed = window.confirm('Ha desactivado todas las alertas. ¿Desea continuar?');
      if (!confirmed) return;
    }

    const saved = await guardarConfiguracionAlertas(settings);
    if (!saved) {
      setToast('No se pudo guardar la configuración. Intente nuevamente.');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    setToast('Configuración de alertas guardada correctamente.');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div>
      <div className="ff-page-header">
        <h4><i className="bi bi-sliders me-2" style={{ color: 'var(--ff-orange)' }} />Configuración de Alertas</h4>
        <p>Personalice qué tipos de alertas genera el sistema al reportar incidencias o resolver casos.</p>
      </div>

      {toast && <div className="alert alert-success py-2 mb-3"><i className="bi bi-check-circle-fill me-2" />{toast}</div>}

      <div className="ff-card">
        <div className="ff-card-header">Ajustes de notificación</div>
        <div className="p-4">
          <div className="mb-4">
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" id="alertCritica" checked={settings.criticas} onChange={() => handleChange('criticas')} />
              <label className="form-check-label" htmlFor="alertCritica"><strong>Alertas críticas</strong></label>
            </div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
              Notificaciones de fallas críticas que requieren atención inmediata.
            </div>
          </div>

          <div className="mb-4">
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" id="alertInformativa" checked={settings.informativas} onChange={() => handleChange('informativas')} />
              <label className="form-check-label" htmlFor="alertInformativa"><strong>Alertas informativas</strong></label>
            </div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
              Avisos de seguimiento y estado que no son críticos, como resolución de incidencias o tareas operativas.
            </div>
          </div>

          <div className="mb-3">
            <div className="alert alert-info py-3">
              <div className="fw-semibold">Nota:</div>
              Estas opciones controlan las alertas de tipo <strong>crítica</strong> e <strong>informativa</strong> generadas por el sistema. Las alertas de mantenimiento preventivo se siguen notificando de forma normal.
            </div>
          </div>

          <button className="btn btn-ff-primary" onClick={handleSave}>
            <i className="bi bi-save me-1" /> Guardar configuración
          </button>
        </div>
      </div>
    </div>
  );
}
