import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

async function siguienteCodigo(nombre, prefijo) {
  const { data, error } = await supabase.rpc('siguiente_valor', { p_nombre: nombre });
  if (error) throw error;
  return `${prefijo}${data}`;
}

function mapUsuario(r) {
  return {
    id: r.id,
    nombre: r.nombre,
    correo: r.correo,
    contrasena: r.contrasena,
    rol: r.rol,
    estado: r.estado,
    fechaRegistro: (r.fecha_registro ?? '').split('T')[0],
  };
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

function mapAlerta(r) {
  return {
    id: r.id,
    tipo: r.tipo,
    mensaje: r.mensaje,
    maquinaria: r.maquinaria,
    fechaEnvio: (r.fecha_envio ?? '').split('T')[0],
    estado: r.estado,
  };
}

function mapChecklist(r) {
  return {
    id: r.id,
    nombre: r.nombre,
    tipoMaquina: r.tipo_maquina,
    estado: r.estado,
    fechaCreacion: (r.fecha_creacion ?? '').split('T')[0],
    items: (r.checklist_items ?? [])
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map(i => ({ id: i.id, tarea: i.tarea, obligatorio: i.obligatorio, orden: i.orden })),
  };
}

function mapRegistro(r) {
  return {
    id: r.id,
    maquinariaId: r.maquina_id,
    checklistId: r.checklist_id,
    fechaEjecucion: (r.fecha_ejecucion ?? '').split('T')[0],
    usuario: r.usuario_nombre,
    resultadoGeneral: r.resultado_general,
    observaciones: r.observaciones ?? '',
    firmaDigital: r.firma_digital ?? '',
    items: (r.registro_items ?? [])
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map(i => ({
        id: i.checklist_item_id ?? i.id,
        tarea: i.tarea,
        obligatorio: i.obligatorio,
        orden: i.orden,
        resultado: i.resultado,
      })),
  };
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [maquinaria, setMaquinaria] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [alertas, setAlertas] = useState([]);

  // ---------- Cargas desde la BD ----------

  const cargarUsuarios = useCallback(async () => {
    const { data, error } = await supabase.from('usuarios').select('*').order('fecha_registro');
    if (error) { console.error('Error cargando usuarios:', error); return; }
    setUsuarios(data.map(mapUsuario));
  }, []);

  const cargarMaquinaria = useCallback(async () => {
    const { data, error } = await supabase.from('maquinas').select('*').order('fecha_creacion');
    if (error) { console.error('Error cargando maquinaria:', error); return; }
    setMaquinaria(data.map(mapMaquina));
  }, []);

  const cargarChecklists = useCallback(async () => {
    const { data, error } = await supabase
      .from('checklists')
      .select('*, checklist_items(*)')
      .order('fecha_creacion');
    if (error) { console.error('Error cargando checklists:', error); return; }
    setChecklists(data.map(mapChecklist));
  }, []);

  const cargarIncidencias = useCallback(async () => {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*, maquina:maquinas(id, nombre)')
      .order('fecha_registro', { ascending: false });
    if (error) { console.error('Error cargando incidencias:', error); return; }
    setIncidencias(data.map(mapIncidencia));
  }, []);

  const cargarRegistros = useCallback(async () => {
    const { data, error } = await supabase
      .from('registros_checklist')
      .select('*, registro_items(*)')
      .order('fecha_ejecucion', { ascending: false });
    if (error) { console.error('Error cargando registros:', error); return; }
    setRegistros(data.map(mapRegistro));
  }, []);

  const cargarAlertas = useCallback(async () => {
    const { data, error } = await supabase
      .from('alertas')
      .select('*')
      .order('fecha_envio', { ascending: false });
    if (error) { console.error('Error cargando alertas:', error); return; }
    setAlertas(data.map(mapAlerta));
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      const [usr, maq, ckl, inc, reg, alt] = await Promise.all([
        supabase.from('usuarios').select('*').order('fecha_registro'),
        supabase.from('maquinas').select('*').order('fecha_creacion'),
        supabase.from('checklists').select('*, checklist_items(*)').order('fecha_creacion'),
        supabase.from('incidencias').select('*, maquina:maquinas(id, nombre)').order('fecha_registro', { ascending: false }),
        supabase.from('registros_checklist').select('*, registro_items(*)').order('fecha_ejecucion', { ascending: false }),
        supabase.from('alertas').select('*').order('fecha_envio', { ascending: false }),
      ]);
      if (!activo) return;
      if (usr.error) console.error('Error cargando usuarios:', usr.error);
      else setUsuarios(usr.data.map(mapUsuario));
      if (maq.error) console.error('Error cargando maquinaria:', maq.error);
      else setMaquinaria(maq.data.map(mapMaquina));
      if (ckl.error) console.error('Error cargando checklists:', ckl.error);
      else setChecklists(ckl.data.map(mapChecklist));
      if (inc.error) console.error('Error cargando incidencias:', inc.error);
      else setIncidencias(inc.data.map(mapIncidencia));
      if (reg.error) console.error('Error cargando registros:', reg.error);
      else setRegistros(reg.data.map(mapRegistro));
      if (alt.error) console.error('Error cargando alertas:', alt.error);
      else setAlertas(alt.data.map(mapAlerta));
    })();
    return () => { activo = false; };
  }, []);

  // ---------- Autenticación ----------

  const login = async (correo, contrasena) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .eq('contrasena', contrasena)
      .eq('estado', true)
      .maybeSingle();
    if (error) { console.error('Error en login:', error); return false; }
    if (data) { setUsuario(mapUsuario(data)); return true; }
    return false;
  };
  const logout = () => setUsuario(null);

  // ---------- Usuarios ----------

  const agregarUsuario = async (data) => {
    const { error } = await supabase.from('usuarios').insert({
      nombre: data.nombre,
      correo: data.correo,
      contrasena: data.contrasena,
      rol: data.rol,
    });
    if (error) throw error;
    await cargarUsuarios();
  };

  const editarUsuario = async (id, data) => {
    const { error } = await supabase.from('usuarios').update({
      nombre: data.nombre,
      correo: data.correo,
      rol: data.rol,
    }).eq('id', id);
    if (error) throw error;
    await cargarUsuarios();
  };

  const toggleUsuario = async (id) => {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;
    const { error } = await supabase.from('usuarios').update({ estado: !u.estado }).eq('id', id);
    if (error) { console.error('Error cambiando estado de usuario:', error); return; }
    await cargarUsuarios();
  };

  // ---------- Maquinaria ----------

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

  // ---------- Checklists ----------

  const agregarChecklist = async (data) => {
    const { data: ck, error } = await supabase.from('checklists').insert({
      nombre: data.nombre,
      tipo_maquina: data.tipoMaquina,
    }).select('id').single();
    if (error) throw error;
    const rows = data.items.map((it, idx) => ({
      checklist_id: ck.id,
      tarea: it.tarea,
      obligatorio: it.obligatorio,
      orden: it.orden ?? idx + 1,
    }));
    const { error: errorItems } = await supabase.from('checklist_items').insert(rows);
    if (errorItems) throw errorItems;
    await cargarChecklists();
  };

  // ---------- Incidencias ----------

  const agregarIncidencia = async (data) => {
    const codigo = await siguienteCodigo('incidencia', 'INC');

    // Subir la evidencia fotográfica a Supabase Storage y guardar su URL pública.
    // Si el bucket 'evidencias' no está configurado, no bloqueamos el registro de
    // la incidencia: se guarda sin evidencia y se deja constancia en consola.
    let evidenciaUrl = data.evidenciaUrl ?? null;
    if (data.evidenciaFile) {
      const ext = (data.evidenciaFile.name.split('.').pop() || 'jpg').toLowerCase();
      const ruta = `${codigo}-${Date.now()}.${ext}`;
      const { error: errorSubida } = await supabase.storage
        .from('evidencias')
        .upload(ruta, data.evidenciaFile, { contentType: data.evidenciaFile.type, upsert: false });
      if (errorSubida) {
        console.warn('No se pudo subir la evidencia a Storage (¿existe el bucket "evidencias"?):', errorSubida.message);
        evidenciaUrl = null;
      } else {
        evidenciaUrl = supabase.storage.from('evidencias').getPublicUrl(ruta).data.publicUrl;
      }
    }

    const { error } = await supabase.from('incidencias').insert({
      codigo,
      maquina_id: data.maquinariaId,
      categoria: data.categoria,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
      reportado_por: data.reportadoPor ?? null,
      evidencia_url: evidenciaUrl,
    });
    if (error) throw error;

    // Coordinar el estado de la máquina con la incidencia: una falla crítica o
    // alta deja la máquina fuera de servicio (simétrico a la resolución, que la
    // devuelve a 'Operativa'). Las prioridades menores no cambian el estado.
    if (data.maquinariaId && (data.prioridad === 'CRITICA' || data.prioridad === 'ALTA')) {
      await actualizarEstadoMaquina(data.maquinariaId, 'Con Falla');
    }

    const esAlertaCritica = data.prioridad === 'CRITICA';
    const { error: errorAlerta } = await supabase.from('alertas').insert({
      tipo: esAlertaCritica ? 'CRITICA' : 'INFORMATIVA',
      mensaje: `${esAlertaCritica ? 'FALLA CRÍTICA' : 'Nueva incidencia'}: ${data.maquinariaNombre} — ${data.descripcion.substring(0, 60)}`,
      maquinaria: data.maquinariaNombre,
      estado: 'ENVIADA',
    });
    if (errorAlerta) console.error('Error guardando alerta:', errorAlerta);

    await Promise.all([cargarIncidencias(), cargarAlertas()]);
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
      const { error: errorAlerta } = await supabase.from('alertas').insert({
        tipo: 'INFORMATIVA',
        mensaje: `Incidencia ${inc?.codigo ?? id} marcada como Resuelta`,
        maquinaria: inc?.maquinariaNombre ?? '—',
        estado: 'ENVIADA',
      });
      if (errorAlerta) console.error('Error guardando alerta de resolución:', errorAlerta);
      await cargarAlertas();
    }
    await cargarIncidencias();
  };

  // ---------- Registros de checklist ----------

  const agregarRegistro = async (data) => {
    const conforme = data.items.every(i => i.resultado !== 'no_cumple');
    const { data: reg, error } = await supabase.from('registros_checklist').insert({
      maquina_id: data.maquinariaId,
      checklist_id: data.checklistId,
      usuario_nombre: data.usuario,
      resultado_general: conforme ? 'Conforme' : 'No Conforme',
      observaciones: data.observaciones || null,
      firma_digital: data.firmaDigital || null,
    }).select('id').single();
    if (error) throw error;

    const rows = data.items.map(i => ({
      registro_id: reg.id,
      checklist_item_id: i.id,
      tarea: i.tarea,
      obligatorio: i.obligatorio,
      orden: i.orden,
      resultado: i.resultado,
    }));
    const { error: errorItems } = await supabase.from('registro_items').insert(rows);
    if (errorItems) console.error('Error guardando ítems del registro:', errorItems);

    await actualizarEstadoMaquina(data.maquinariaId, conforme ? 'Operativa' : 'En Mantenimiento');

    // Coordinar alerta con el resultado del checklist: si quedó No Conforme, la
    // máquina pasa a mantenimiento y se emite una alerta PREVENTIVA para el panel.
    if (!conforme) {
      const maquina = maquinaria.find(m => m.id === data.maquinariaId);
      const nombreMaquina = maquina?.nombre ?? '—';
      const { error: errorAlerta } = await supabase.from('alertas').insert({
        tipo: 'PREVENTIVA',
        mensaje: `Mantenimiento requerido: ${nombreMaquina} — checklist con ítems no conformes`,
        maquinaria: nombreMaquina,
        estado: 'ENVIADA',
      });
      if (errorAlerta) console.error('Error guardando alerta preventiva:', errorAlerta);
      await cargarAlertas();
    }

    await cargarRegistros();
  };

  // ---------- Alertas ----------

  const marcarAlertaLeida = async (id) => {
    const { error } = await supabase.from('alertas').update({ estado: 'LEIDA' }).eq('id', id);
    if (error) { console.error('Error marcando alerta como leída:', error); return; }
    await cargarAlertas();
  };

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
