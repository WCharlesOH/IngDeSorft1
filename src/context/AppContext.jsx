import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

async function siguienteCodigo(nombre, prefijo) {
  const { data, error } = await supabase.rpc('siguiente_valor', { p_nombre: nombre });
  if (error) throw error;
  return `${prefijo}${data}`;
}

function mapMaquina(r) {
  return {
    id: r.id,
    codigoUnico: r.codigo_unico,
    nombre: r.nombre,
    linea: r.linea,
    tipo: r.tipo,
    estado: r.estado,
    ubicacion: r.ubicacion,
    fechaCreacion: r.fecha_creacion,
  };
}

// La consulta trae la máquina anidada, espera maquinariaId/maquinariaNombre planos.
function mapIncidencia(r) {
  return {
    id: r.id,
    codigo: r.codigo,
    maquinariaId: r.maquina_id,
    maquinariaNombre: r.maquina?.nombre ?? '—',
    categoria: r.categoria,
    descripcion: r.descripcion,
    prioridad: r.prioridad,
    estado: r.estado,
    fechaRegistro: (r.fecha_registro ?? '').split('T')[0],
    reportadoPor: r.reportado_por ?? '',
    comentarioTecnico: r.comentario_tecnico ?? '',
    evidenciaUrl: r.evidencia_url ?? null,
  };
}

const AppContext = createContext(null);

const INITIAL_USERS = [
  { id: 'U1', nombre: 'Admin Sistema', correo: 'admin@carvimsa.com', contrasena: 'admin123', rol: 'administrador', estado: true, fechaRegistro: '2024-01-01' },
  { id: 'U2', nombre: 'Carlos Mendoza', correo: 'supervisor@carvimsa.com', contrasena: 'super123', rol: 'supervisor', estado: true, fechaRegistro: '2024-01-10' },
  { id: 'U3', nombre: 'Luis Torres', correo: 'operario@carvimsa.com', contrasena: 'oper123', rol: 'operario', estado: true, fechaRegistro: '2024-01-15' },
  { id: 'U4', nombre: 'Ana Quispe', correo: 'a.quispe@carvimsa.com', contrasena: 'oper456', rol: 'operario', estado: true, fechaRegistro: '2024-02-01' },
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
  const [maquinaria, setMaquinaria] = useState([]);
  const [checklists, setChecklists] = useState(INITIAL_CHECKLISTS);
  const [incidencias, setIncidencias] = useState([]);
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

  // --- Maquinaria e Incidencias: persistidas en Supabase ---
  const cargarMaquinaria = useCallback(async () => {
    const { data, error } = await supabase.from('maquinas').select('*').order('fecha_creacion');
    if (error) { console.error('Error cargando maquinaria:', error); return; }
    setMaquinaria(data.map(mapMaquina));
  }, []);

  const cargarIncidencias = useCallback(async () => {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*, maquina:maquinas(id, nombre)')
      .order('fecha_registro', { ascending: false });
    if (error) { console.error('Error cargando incidencias:', error); return; }
    setIncidencias(data.map(mapIncidencia));
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      const [maq, inc] = await Promise.all([
        supabase.from('maquinas').select('*').order('fecha_creacion'),
        supabase.from('incidencias').select('*, maquina:maquinas(id, nombre)').order('fecha_registro', { ascending: false }),
      ]);
      if (!activo) return;
      if (maq.error) console.error('Error cargando maquinaria:', maq.error);
      else setMaquinaria(maq.data.map(mapMaquina));
      if (inc.error) console.error('Error cargando incidencias:', inc.error);
      else setIncidencias(inc.data.map(mapIncidencia));
    })();
    return () => { activo = false; };
  }, []);

  const agregarMaquina = async (data) => {
    const codigo = await siguienteCodigo('maquina', 'M');
    const { error } = await supabase.from('maquinas').insert({
      codigo_unico: codigo,
      nombre: data.nombre,
      linea: data.linea,
      tipo: data.tipo,
      ubicacion: data.ubicacion,
    });
    if (error) throw error;
    await cargarMaquinaria();
  };

  const editarMaquina = async (id, data) => {
    const { error } = await supabase.from('maquinas').update({
      nombre: data.nombre,
      linea: data.linea,
      tipo: data.tipo,
      ubicacion: data.ubicacion,
      estado: data.estado,
    }).eq('id', id);
    if (error) throw error;
    await cargarMaquinaria();
  };

  const actualizarEstadoMaquina = async (id, estado) => {
    const { error } = await supabase.from('maquinas').update({ estado }).eq('id', id);
    if (error) throw error;
    await cargarMaquinaria();
  };

  const agregarChecklist = (data) => {
    const nuevo = { ...data, id: `CHL-${Date.now()}`, estado: true, fechaCreacion: new Date().toISOString().split('T')[0] };
    setChecklists(prev => [...prev, nuevo]);
  };

  const agregarIncidencia = async (data) => {
    const codigo = await siguienteCodigo('incidencia', 'INC');
    const { error } = await supabase.from('incidencias').insert({
      codigo,
      maquina_id: data.maquinariaId,
      categoria: data.categoria,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
      reportado_por: data.reportadoPor ?? null,
      evidencia_url: data.evidenciaUrl ?? null,
    });
    if (error) throw error;
    await cargarIncidencias();
    // La alerta sigue en memoria, las alertas aún no están en la BD
    const esAlertaCritica = data.prioridad === 'CRITICA';
    const alerta = {
      id: `ALT-${Date.now()}`, tipo: esAlertaCritica ? 'CRITICA' : 'INFORMATIVA',
      mensaje: `${esAlertaCritica ? 'FALLA CRÍTICA' : 'Nueva incidencia'}: ${data.maquinariaNombre} — ${data.descripcion.substring(0, 60)}`,
      maquinaria: data.maquinariaNombre, fechaEnvio: new Date().toISOString().split('T')[0], estado: 'ENVIADA',
    };
    setAlertas(prev => [alerta, ...prev]);
  };

  const actualizarIncidencia = async (id, data) => {
    const { error } = await supabase.from('incidencias').update({
      estado: data.estado,
      comentario_tecnico: data.comentarioTecnico ?? null,
    }).eq('id', id);
    if (error) throw error;
    if (data.estado === 'RESUELTA') {
      const inc = incidencias.find(i => i.id === id);
      if (inc?.maquinariaId) await actualizarEstadoMaquina(inc.maquinariaId, 'Operativa');
    }
    await cargarIncidencias();
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
