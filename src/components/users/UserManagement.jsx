import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const ROLES = ['operario', 'supervisor', 'administrador'];

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || { nombre: '', correo: '', contrasena: '', rol: 'operario' });
  const [error, setError] = useState('');
  const { usuarios } = useApp();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.nombre || !form.correo || (!user && !form.contrasena) || !form.rol) { setError('Complete todos los campos obligatorios.'); return; }
    const dup = usuarios.find(u => u.correo === form.correo && u.id !== form.id);
    if (dup) { setError('El correo electrónico ya se encuentra registrado.'); return; }
    onSave(form);
  };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--ff-navy)', color: '#fff' }}>
            <h5 className="modal-title"><i className="bi bi-person-plus me-2" />{user ? 'Editar Usuario' : 'Registrar Usuario'}</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2"><small>{error}</small></div>}
            <div className="mb-3">
              <label className="ff-form-label">Nombre completo *</label>
              <input className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej. Juan Pérez García" />
            </div>
            <div className="mb-3">
              <label className="ff-form-label">Correo institucional *</label>
              <input type="email" className="form-control" value={form.correo} onChange={e => set('correo', e.target.value)} placeholder="usuario@carvimsa.com" />
            </div>
            {!user && (
              <div className="mb-3">
                <label className="ff-form-label">Contraseña temporal *</label>
                <input type="text" className="form-control" value={form.contrasena} onChange={e => set('contrasena', e.target.value)} placeholder="Contraseña inicial" />
                <div className="form-text">Se enviará por correo al usuario.</div>
              </div>
            )}
            <div className="mb-3">
              <label className="ff-form-label">Rol *</label>
              <select className="form-select" value={form.rol} onChange={e => set('rol', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-ff-primary" onClick={handleSave}>
              <i className="bi bi-check-lg me-1" />{user ? 'Guardar Cambios' : 'Registrar Usuario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const { usuarios, agregarUsuario, editarUsuario, toggleUsuario } = useApp();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = (form) => {
    if (form.id) { editarUsuario(form.id, form); showToast('Usuario actualizado correctamente.'); }
    else { agregarUsuario(form); showToast('Usuario registrado. Se ha enviado el correo con accesos temporales.'); }
    setModal(null);
  };

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    return (u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)) && (!filtroRol || u.rol === filtroRol);
  });

  const rolIcon = { administrador: 'bi-person-gear', supervisor: 'bi-person-badge', operario: 'bi-person-check' };

  return (
    <div>
      <div className="ff-page-header d-flex justify-content-between align-items-start">
        <div>
          <h4><i className="bi bi-people me-2" style={{ color: 'var(--ff-orange)' }} />Gestión de Usuarios</h4>
          <p>Administre las cuentas de acceso al sistema FixFlow</p>
        </div>
        <button className="btn btn-ff-primary" onClick={() => setModal({})}>
          <i className="bi bi-person-plus me-1" />Nuevo Usuario
        </button>
      </div>

      {toast && <div className="alert alert-success py-2 d-flex align-items-center gap-2 mb-3"><i className="bi bi-check-circle-fill" /><small>{toast}</small></div>}

      {/* Filters */}
      <div className="ff-card mb-3">
        <div className="p-3 d-flex gap-3 flex-wrap align-items-center">
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input className="form-control" placeholder="Buscar por nombre o correo..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ maxWidth: 180 }} value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
            <option value="">Todos los roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <div className="ms-auto d-flex gap-3">
            {ROLES.map(r => (
              <div key={r} className="text-center">
                <div className="fw-bold" style={{ color: 'var(--ff-navy)' }}>{usuarios.filter(u => u.rol === r).length}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{r.charAt(0).toUpperCase() + r.slice(1)}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ff-card">
        <table className="table ff-table mb-0">
          <thead>
            <tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Fecha Registro</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="ff-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                      {u.nombre.split(' ').map(w => w[0]).slice(0,2).join('')}
                    </div>
                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{u.nombre}</span>
                  </div>
                </td>
                <td><small>{u.correo}</small></td>
                <td>
                  <span className={`ff-role-badge ff-role-${u.rol} d-inline-flex align-items-center gap-1`}>
                    <i className={`bi ${rolIcon[u.rol]}`} />{u.rol}
                  </span>
                </td>
                <td><small className="text-muted">{u.fechaRegistro}</small></td>
                <td>
                  <span className={`ff-status-badge ${u.estado ? 'ff-badge-operativa' : 'ff-badge-falla'}`}>
                    <span className="ff-status-dot" style={{ background: u.estado ? '#22c55e' : '#ef4444' }} />
                    {u.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" title="Editar" onClick={() => setModal(u)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button className={`btn btn-sm btn-outline-${u.estado ? 'danger' : 'success'}`} title={u.estado ? 'Dar de baja' : 'Reactivar'} onClick={() => toggleUsuario(u.id)}>
                    <i className={`bi bi-person-${u.estado ? 'dash' : 'check'}`} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6}><div className="ff-empty"><i className="bi bi-people" />No se encontraron usuarios</div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal !== null && <UserModal user={modal?.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
