import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(correo, contrasena);
    if (!ok) setError('Credenciales incorrectas. Por favor, intente de nuevo.');
    setLoading(false);
  };

  const fillDemo = (rol) => {
    const creds = { administrador: ['admin@carvimsa.com','admin123'], supervisor: ['supervisor@carvimsa.com','super123'], operario: ['operario@carvimsa.com','oper123'] };
    setCorreo(creds[rol][0]); setContrasena(creds[rol][1]); setError('');
  };

  return (
    <div className="ff-login-bg">
      <div className="ff-login-card">
        <div className="text-center mb-4">
          <div className="ff-logo-badge mb-3">FixFlow</div>
          <h5 className="fw-bold mb-1" style={{ color: '#0f2340' }}>Gestión de Mantenimiento Industrial</h5>
          <p className="ff-login-subtitle">CARVIMSA · Ingrese sus credenciales institucionales</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="ff-form-label">Correo electrónico</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-secondary" /></span>
              <input type="email" className="form-control ff-input border-start-0" placeholder="usuario@carvimsa.com"
                value={correo} onChange={e => setCorreo(e.target.value)} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="ff-form-label">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-secondary" /></span>
              <input type={showPass ? 'text' : 'password'} className="form-control ff-input border-start-0 border-end-0"
                placeholder="••••••••" value={contrasena} onChange={e => setContrasena(e.target.value)} required />
              <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setShowPass(!showPass)}>
                <i className={`bi bi-eye${showPass ? '-slash' : ''} text-secondary`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2 d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-circle-fill" /><small>{error}</small>
            </div>
          )}

          <button type="submit" className="btn btn-ff-primary w-100 py-2 fw-600 mt-1" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Verificando...</> : <><i className="bi bi-box-arrow-in-right me-2" />Iniciar Sesión</>}
          </button>
        </form>

        <hr className="my-3" />
        <p className="text-center mb-2" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Acceso rápido para demo</p>
        <div className="d-flex gap-2">
          {['administrador','supervisor','operario'].map(r => (
            <button key={r} className="btn btn-outline-secondary btn-sm flex-fill" style={{ fontSize: '0.7rem' }} onClick={() => fillDemo(r)}>
              <i className={`bi bi-person${r === 'administrador' ? '-gear' : r === 'supervisor' ? '-badge' : ''} me-1`} />
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-center mt-4 mb-0" style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
          <i className="bi bi-shield-lock me-1" />Acceso restringido — Solo personal autorizado de CARVIMSA
        </p>
      </div>
    </div>
  );
}
