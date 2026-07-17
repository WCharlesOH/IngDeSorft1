-- ============================================================
-- FixFlow — Datos demo para Supabase
-- ============================================================

-- Usuarios (los mismos que estaban hardcodeados en AppContext.jsx)
insert into usuarios (nombre, correo, contrasena, rol, estado, fecha_registro) values
  ('Admin Sistema',   'admin@carvimsa.com',      'admin123', 'administrador', true, '2024-01-01'),
  ('Carlos Mendoza',  'supervisor@carvimsa.com', 'super123', 'supervisor',    true, '2024-01-10'),
  ('Luis Torres',     'operario@carvimsa.com',   'oper123',  'operario',      true, '2024-01-15'),
  ('Ana Quispe',      'a.quispe@carvimsa.com',   'oper456',  'operario',      true, '2024-02-01')
on conflict (correo) do nothing;

-- Máquinas (M1..M5)
insert into maquinas (codigo_unico, nombre, linea, tipo, estado, ubicacion) values
  ('M1', 'Corrugadora Principal A',  'Línea 1', 'Corrugadora',    'Operativa',        'Nave A'),
  ('M2', 'Ranuradora B-12',          'Línea 2', 'Ranuradora',     'En Mantenimiento', 'Nave B'),
  ('M3', 'Paletizadora L3',          'Línea 3', 'Paletizadora',   'Con Falla',        'Nave C'),
  ('M4', 'Corrugadora Secundaria B', 'Línea 1', 'Corrugadora',    'Operativa',        'Nave A'),
  ('M5', 'Línea Continua C-7',       'Línea 4', 'Línea Continua', 'Operativa',        'Nave D');

-- Incidencias (referencian la máquina por nombre para tomar su id real)
insert into incidencias (codigo, maquina_id, categoria, descripcion, prioridad, estado, reportado_por, comentario_tecnico)
select 'INC1', id, 'Mecánica', 'Desgaste excesivo en cuchillas de ranura, afecta calidad de corte.', 'ALTA', 'EN_PROCESO', 'Luis Torres', 'Se programó reemplazo de cuchillas para el turno noche.'
from maquinas where nombre = 'Ranuradora B-12';

insert into incidencias (codigo, maquina_id, categoria, descripcion, prioridad, estado, reportado_por)
select 'INC2', id, 'Eléctrica', 'Fallo en motor principal del brazo paletizador, parada inesperada de línea 3.', 'CRITICA', 'ABIERTA', 'Ana Quispe'
from maquinas where nombre = 'Paletizadora L3';

insert into incidencias (codigo, maquina_id, categoria, descripcion, prioridad, estado, reportado_por, comentario_tecnico)
select 'INC3', id, 'Mecánica', 'Vibración anormal en rodillo de presión durante producción.', 'MEDIA', 'RESUELTA', 'Luis Torres', 'Se ajustaron tornillos de fijación y se lubricó el eje. Máquina operativa.'
from maquinas where nombre = 'Corrugadora Principal A';

insert into incidencias (codigo, maquina_id, categoria, descripcion, prioridad, estado, reportado_por, comentario_tecnico)
select 'INC4', id, 'Eléctrica', 'Fallo intermitente en tablero de control principal.', 'ALTA', 'RESUELTA', 'Luis Torres', 'Reemplazo de tarjeta de control. Máquina operativa.'
from maquinas where nombre = 'Corrugadora Principal A';

-- Alertas (una crítica por INC2, una informativa por la resolución de INC3)
insert into alertas (maquina_id, tipo, mensaje, maquinaria, estado)
select id, 'CRITICA', 'FALLA CRÍTICA: Paletizadora L3 — Fallo en motor principal del brazo paletizador', 'Paletizadora L3', 'ENVIADA'
from maquinas where nombre = 'Paletizadora L3';

insert into alertas (maquina_id, tipo, mensaje, maquinaria, estado)
select id, 'INFORMATIVA', 'Incidencia INC3 marcada como Resuelta', 'Corrugadora Principal A', 'LEIDA'
from maquinas where nombre = 'Corrugadora Principal A';

-- Checklists de mantenimiento preventivo (HU05) con sus tareas
with ck1 as (
  insert into checklists (nombre, tipo_maquina, estado, fecha_creacion)
  values ('Mantenimiento Preventivo Corrugadora', 'Corrugadora', true, '2024-03-01')
  returning id
)
insert into checklist_items (checklist_id, tarea, obligatorio, orden)
select id, tarea, obligatorio, orden from ck1, (values
  ('Verificar tensión de correa principal', true, 1),
  ('Inspeccionar rodillos de presión',       true, 2),
  ('Lubricar cadenas de transmisión',        true, 3),
  ('Revisar sistema eléctrico',              false, 4),
  ('Limpiar filtros de aspiración',          true, 5)
) as t(tarea, obligatorio, orden);

with ck2 as (
  insert into checklists (nombre, tipo_maquina, estado, fecha_creacion)
  values ('Inspección Ranuradora', 'Ranuradora', true, '2024-03-10')
  returning id
)
insert into checklist_items (checklist_id, tarea, obligatorio, orden)
select id, tarea, obligatorio, orden from ck2, (values
  ('Verificar cuchillas de ranura', true, 1),
  ('Calibrar presión de corte',     true, 2),
  ('Revisar sistema de avance',     true, 3)
) as t(tarea, obligatorio, orden);

with ck3 as (
  insert into checklists (nombre, tipo_maquina, estado, fecha_creacion)
  values ('Revisión Paletizadora', 'Paletizadora', true, '2024-04-01')
  returning id
)
insert into checklist_items (checklist_id, tarea, obligatorio, orden)
select id, tarea, obligatorio, orden from ck3, (values
  ('Inspeccionar brazo robótico',        true, 1),
  ('Verificar sensores de posición',     true, 2),
  ('Revisar sistema neumático',          false, 3)
) as t(tarea, obligatorio, orden);

-- Registros de ejecución de checklist (HU06)
insert into registros_checklist (maquina_id, checklist_id, usuario_nombre, fecha_ejecucion, resultado_general, firma_digital, observaciones)
select m.id, c.id, 'Luis Torres', '2026-06-15', 'Conforme', 'LT-2026', 'Todo en orden, lubricación al día.'
from maquinas m, checklists c
where m.nombre = 'Corrugadora Principal A' and c.nombre = 'Mantenimiento Preventivo Corrugadora';

insert into registros_checklist (maquina_id, checklist_id, usuario_nombre, fecha_ejecucion, resultado_general, firma_digital, observaciones)
select m.id, c.id, 'Ana Quispe', '2026-06-14', 'No Conforme', 'AQ-2026', 'Se detectó desgaste en correa secundaria.'
from maquinas m, checklists c
where m.nombre = 'Corrugadora Secundaria B' and c.nombre = 'Mantenimiento Preventivo Corrugadora';

-- Fichas técnicas (HU6): M1 y M2 llegan con ficha registrada; M3..M5 quedan
-- pendientes para poder probar el flujo de "Completar Ficha Técnica".
insert into fichas_tecnicas (maquina_id, marca, modelo, numero_serie, anio_fabricacion, potencia, voltaje, capacidad, dimensiones, peso, estado_inicial, observaciones)
select id, 'BHS Corrugated', 'QF-2400', 'BHS-2019-08841', 2019, '110 kW', '440 V trifásico', '250 m/min', '12.5 × 3.2 × 2.8 m', '18 500 kg', 'Operativa', 'Instalada en 2020. Última actualización de rodillos en 2024.'
from maquinas where nombre = 'Corrugadora Principal A'
on conflict (maquina_id) do nothing;

insert into fichas_tecnicas (maquina_id, marca, modelo, numero_serie, anio_fabricacion, potencia, voltaje, capacidad, dimensiones, peso, estado_inicial, observaciones)
select id, 'Bobst', 'FFG 618', 'BST-2017-33210', 2017, '75 kW', '380 V trifásico', '18 000 cajas/h', '9.8 × 2.6 × 2.4 m', '12 300 kg', 'Operativa', 'Cuchillas de ranura con desgaste acelerado; revisión trimestral.'
from maquinas where nombre = 'Ranuradora B-12'
on conflict (maquina_id) do nothing;

-- Contadores: los próximos generados por la app serán M6 / INC5
insert into contadores (nombre, valor) values ('maquina', 5), ('incidencia', 4)
on conflict (nombre) do update set valor = excluded.valor;


