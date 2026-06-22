import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const INITIAL_USERS = [
  { id: 'U1', nombre: 'Admin Sistema', correo: 'admin@carvimsa.com', contrasena: 'admin123', rol: 'administrador', estado: true, fechaRegistro: '2024-01-01' },
  { id: 'U2', nombre: 'Carlos Mendoza', correo: 'supervisor@carvimsa.com', contrasena: 'super123', rol: 'supervisor', estado: true, fechaRegistro: '2024-01-10' },
  { id: 'U3', nombre: 'Luis Torres', correo: 'operario@carvimsa.com', contrasena: 'oper123', rol: 'operario', estado: true, fechaRegistro: '2024-01-15' },
  { id: 'U4', nombre: 'Ana Quispe', correo: 'a.quispe@carvimsa.com', contrasena: 'oper456', rol: 'operario', estado: true, fechaRegistro: '2024-02-01' },
];

const INITIAL_MAQUINARIA = [
  { id: 'MAQ-001', codigoUnico: 'FF-2024-001', nombre: 'Corrugadora Principal A', linea: 'Línea 1', tipo: 'Corrugadora', estado: 'Operativa', ubicacion: 'Nave A', fechaCreacion: '2024-01-15' },
  { id: 'MAQ-002', codigoUnico: 'FF-2024-002', nombre: 'Ranuradora B-12', linea: 'Línea 2', tipo: 'Ranuradora', estado: 'En Mantenimiento', ubicacion: 'Nave B', fechaCreacion: '2024-01-20' },
  { id: 'MAQ-003', codigoUnico: 'FF-2024-003', nombre: 'Paletizadora L3', linea: 'Línea 3', tipo: 'Paletizadora', estado: 'Con Falla', ubicacion: 'Nave C', fechaCreacion: '2024-02-01' },
  { id: 'MAQ-004', codigoUnico: 'FF-2024-004', nombre: 'Corrugadora Secundaria B', linea: 'Línea 1', tipo: 'Corrugadora', estado: 'Operativa', ubicacion: 'Nave A', fechaCreacion: '2024-02-10' },
  { id: 'MAQ-005', codigoUnico: 'FF-2024-005', nombre: 'Línea Continua C-7', linea: 'Línea 4', tipo: 'Línea Continua', estado: 'Operativa', ubicacion: 'Nave D', fechaCreacion: '2024-03-01' },
];

const INITIAL_CHECKLISTS = [
  {
    id: 'CHL-001', nombre: 'Mantenimiento Preventivo Corrugadora', tipoMaquina: 'Corrugadora', estado: true, fechaCreacion: '2024-03-01',
    items: [
      { id: 'I1', tarea: 'Verificar tensión de correa principal', obligatorio: true, orden: 1 },
      { id: 'I2', tarea: 'Inspeccionar rodillos de presión', obligatorio: true, orden: 2 },
      { id: 'I3', tarea: 'Lubricar cadenas de transmisión', obligatorio: true, orden: 3 },
      { id: 'I4', tarea: 'Revisar sistema eléctrico', obligatorio: false, orden: 4 },
      { id: 'I5', tarea: 'Limpiar filtros de aspiración', obligatorio: true, orden: 5 },
    ],
  },
  {
    id: 'CHL-002', nombre: 'Inspección Ranuradora', tipoMaquina: 'Ranuradora', estado: true, fechaCreacion: '2024-03-10',
    items: [
      { id: 'I1', tarea: 'Verificar cuchillas de ranura', obligatorio: true, orden: 1 },
      { id: 'I2', tarea: 'Calibrar presión de corte', obligatorio: true, orden: 2 },
      { id: 'I3', tarea: 'Revisar sistema de avance', obligatorio: true, orden: 3 },
    ],
  },
  {
    id: 'CHL-003', nombre: 'Revisión Paletizadora', tipoMaquina: 'Paletizadora', estado: true, fechaCreacion: '2024-04-01',
    items: [
      { id: 'I1', tarea: 'Inspeccionar brazo robótico', obligatorio: true, orden: 1 },
      { id: 'I2', tarea: 'Verificar sensores de posición', obligatorio: true, orden: 2 },
      { id: 'I3', tarea: 'Revisar sistema neumático', obligatorio: false, orden: 3 },
    ],
  },
];

const INITIAL_INCIDENCIAS = [
  { id: 'INC-001', maquinariaId: 'MAQ-002', maquinariaNombre: 'Ranuradora B-12', categoria: 'Mecánica', descripcion: 'Desgaste excesivo en cuchillas de ranura, afecta calidad de corte.', prioridad: 'ALTA', estado: 'EN_PROCESO', fechaRegistro: '2026-06-10', reportadoPor: 'Luis Torres', comentarioTecnico: 'Se programó reemplazo de cuchillas para el turno noche.', evidenciaUrl: null },
  { id: 'INC-002', maquinariaId: 'MAQ-003', maquinariaNombre: 'Paletizadora L3', categoria: 'Eléctrica', descripcion: 'Fallo en motor principal del brazo paletizador, parada inesperada de línea 3.', prioridad: 'CRITICA', estado: 'ABIERTA', fechaRegistro: '2026-06-18', reportadoPor: 'Ana Quispe', comentarioTecnico: '', evidenciaUrl: null },
  { id: 'INC-003', maquinariaId: 'MAQ-001', maquinariaNombre: 'Corrugadora Principal A', categoria: 'Mecánica', descripcion: 'Vibración anormal en rodillo de presión durante producción.', prioridad: 'MEDIA', estado: 'RESUELTA', fechaRegistro: '2026-05-28', reportadoPor: 'Luis Torres', comentarioTecnico: 'Se ajustaron tornillos de fijación y se lubricó el eje. Máquina operativa.', evidenciaUrl: null },
  { id: 'INC-004', maquinariaId: 'MAQ-001', maquinariaNombre: 'Corrugadora Principal A', categoria: 'Eléctrica', descripcion: 'Fallo intermitente en tablero de control principal.', prioridad: 'ALTA', estado: 'RESUELTA', fechaRegistro: '2026-04-15', reportadoPor: 'Luis Torres', comentarioTecnico: 'Reemplazo de tarjeta de control. Máquina operativa.', evidenciaUrl: null },
];

const INITIAL_REGISTROS = [
  { id: 'REG-001', maquinariaId: 'MAQ-001', checklistId: 'CHL-001', fechaEjecucion: '2026-06-15', usuario: 'Luis Torres', resultadoGeneral: 'Conforme', items: [], firmaDigital: 'LT-2026', observaciones: 'Todo en orden, lubricación al día.' },
  { id: 'REG-002', maquinariaId: 'MAQ-004', checklistId: 'CHL-001', fechaEjecucion: '2026-06-14', usuario: 'Ana Quispe', resultadoGeneral: 'No Conforme', items: [], firmaDigital: 'AQ-2026', observaciones: 'Se detectó desgaste en correa secundaria.' },
];

const INITIAL_ALERTAS = [
  { id: 'ALT-001', tipo: 'CRITICA', mensaje: 'Paletizadora L3 presenta falla crítica — Línea 3 detenida', maquinaria: 'Paletizadora L3', fechaEnvio: '2026-06-18', estado: 'ENVIADA' },
  { id: 'ALT-002', tipo: 'PREVENTIVA', mensaje: 'Mantenimiento preventivo pendiente: Corrugadora Principal A', maquinaria: 'Corrugadora Principal A', fechaEnvio: '2026-06-16', estado: 'LEIDA' },
  { id: 'ALT-003', tipo: 'PREVENTIVA', mensaje: 'Mantenimiento preventivo pendiente: Ranuradora B-12', maquinaria: 'Ranuradora B-12', fechaEnvio: '2026-06-15', estado: 'ENVIADA' },
  { id: 'ALT-004', tipo: 'INFORMATIVA', mensaje: 'Incidencia INC-003 marcada como Resuelta por Carlos Mendoza', maquinaria: 'Corrugadora Principal A', fechaEnvio: '2026-05-29', estado: 'LEIDA' },
];

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [usuarios, setUsuarios] = useState(INITIAL_USERS);
  const [maquinaria, setMaquinaria] = useState(INITIAL_MAQUINARIA);
  const [checklists, setChecklists] = useState(INITIAL_CHECKLISTS);
  const [incidencias, setIncidencias] = useState(INITIAL_INCIDENCIAS);
  const [registros, setRegistros] = useState(INITIAL_REGISTROS);
  const [alertas, setAlertas] = useState(INITIAL_ALERTAS);

  const login = (correo, contrasena) => {
    const u = usuarios.find(x => x.correo === correo && x.contrasena === contrasena && x.estado);
    if (u) { setUsuario(u); return true; }
    return false;
  };
  const logout = () => setUsuario(null);

  const agregarUsuario = (data) => {
    const nuevo = { ...data, id: `U${Date.now()}`, estado: true, fechaRegistro: new Date().toISOString().split('T')[0] };
    setUsuarios(prev => [...prev, nuevo]);
  };
  const editarUsuario = (id, data) => setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  const toggleUsuario = (id) => setUsuarios(prev => prev.map(u => u.id === id ? { ...u, estado: !u.estado } : u));

  const agregarMaquina = (data) => {
    const id = `MAQ-${String(maquinaria.length + 1).padStart(3, '0')}`;
    const codigo = `FF-${new Date().getFullYear()}-${String(maquinaria.length + 1).padStart(3, '0')}`;
    const nueva = { ...data, id, codigoUnico: codigo, estado: 'Operativa', fechaCreacion: new Date().toISOString().split('T')[0] };
    setMaquinaria(prev => [...prev, nueva]);
    return nueva;
  };
  const editarMaquina = (id, data) => setMaquinaria(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  const actualizarEstadoMaquina = (id, estado) => setMaquinaria(prev => prev.map(m => m.id === id ? { ...m, estado } : m));

  const agregarChecklist = (data) => {
    const nuevo = { ...data, id: `CHL-${Date.now()}`, estado: true, fechaCreacion: new Date().toISOString().split('T')[0] };
    setChecklists(prev => [...prev, nuevo]);
  };

  const agregarIncidencia = (data) => {
    const id = `INC-${String(incidencias.length + 1).padStart(3, '0')}`;
    const nueva = { ...data, id, estado: 'ABIERTA', fechaRegistro: new Date().toISOString().split('T')[0], comentarioTecnico: '' };
    setIncidencias(prev => [...prev, nueva]);
    const esAlertaCritica = data.prioridad === 'CRITICA';
    const alerta = {
      id: `ALT-${Date.now()}`, tipo: esAlertaCritica ? 'CRITICA' : 'INFORMATIVA',
      mensaje: `${esAlertaCritica ? 'FALLA CRÍTICA' : 'Nueva incidencia'}: ${data.maquinariaNombre} — ${data.descripcion.substring(0, 60)}`,
      maquinaria: data.maquinariaNombre, fechaEnvio: new Date().toISOString().split('T')[0], estado: 'ENVIADA',
    };
    setAlertas(prev => [alerta, ...prev]);
  };

  const actualizarIncidencia = (id, data) => {
    setIncidencias(prev => prev.map(inc => inc.id === id ? { ...inc, ...data } : inc));
    if (data.estado === 'RESUELTA') {
      const inc = incidencias.find(i => i.id === id);
      if (inc) actualizarEstadoMaquina(inc.maquinariaId, 'Operativa');
    }
  };

  const agregarRegistro = (data) => {
    const nuevo = { ...data, id: `REG-${Date.now()}`, fechaEjecucion: new Date().toISOString().split('T')[0] };
    setRegistros(prev => [...prev, nuevo]);
    const conforme = data.items.every(i => i.resultado !== 'no_cumple');
    actualizarEstadoMaquina(data.maquinariaId, conforme ? 'Operativa' : 'En Mantenimiento');
  };

  const marcarAlertaLeida = (id) => setAlertas(prev => prev.map(a => a.id === id ? { ...a, estado: 'LEIDA' } : a));

  const alertasNoLeidas = alertas.filter(a => a.estado === 'ENVIADA').length;

  return (
    <AppContext.Provider value={{
      usuario, login, logout,
      usuarios, agregarUsuario, editarUsuario, toggleUsuario,
      maquinaria, agregarMaquina, editarMaquina, actualizarEstadoMaquina,
      checklists, agregarChecklist,
      incidencias, agregarIncidencia, actualizarIncidencia,
      registros, agregarRegistro,
      alertas, marcarAlertaLeida, alertasNoLeidas,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
