-- ============================================================
-- FixFlow — Datos demo para Supabase
-- ============================================================

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

-- Contadores: los próximos generados por la app serán M6 / INC5
insert into contadores (nombre, valor) values ('maquina', 5), ('incidencia', 4)
on conflict (nombre) do update set valor = excluded.valor;
