-- ============================================================
-- FixFlow — Esquema de base de datos para Supabase (PostgreSQL)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Tablas ----------

-- Usuarios del sistema (login, roles y administración de cuentas — HU01, HU02, HU11)
create table if not exists usuarios (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  correo        text not null unique,
  contrasena    text not null, -- demo: texto plano. En producción usar Supabase Auth / hash.
  rol           text not null check (rol in ('operario', 'supervisor', 'administrador')),
  estado        boolean not null default true,
  fecha_registro timestamptz not null default now()
);

create table if not exists maquinas (
  id            uuid primary key default gen_random_uuid(),
  codigo_unico  text not null unique,
  nombre        text not null,
  linea         text not null,
  tipo          text not null,
  estado        text not null default 'Operativa',
  ubicacion     text,
  fecha_creacion timestamptz not null default now()
);

create table if not exists incidencias (
  id            uuid primary key default gen_random_uuid(),
  codigo        text unique,
  maquina_id    uuid not null references maquinas(id) on delete cascade,
  categoria     text not null,
  descripcion   text not null,
  prioridad     text not null,
  estado        text not null default 'ABIERTA',
  fecha_registro timestamptz not null default now(),
  reportado_por text,
  comentario_tecnico text,
  evidencia_url text
);

-- Alertas generadas ante incidencias críticas o cambios de estado (HU08, módulo de Alertas).
-- NOTA: AppContext.jsx ya consulta y escribe esta tabla (supabase.from('alertas')),
-- pero no existía en el schema original: sin ella el módulo de alertas fallaba en producción.
create table if not exists alertas (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('CRITICA', 'INFORMATIVA')),
  mensaje     text not null,
  maquinaria  text not null,
  fecha_envio timestamptz not null default now(),
  estado      text not null default 'ENVIADA' check (estado in ('ENVIADA', 'LEIDA'))
);

-- Checklists de mantenimiento preventivo por tipo de máquina (HU05).
create table if not exists checklists (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  tipo_maquina   text not null,
  estado         boolean not null default true,
  fecha_creacion timestamptz not null default now()
);

-- Tareas de inspección que componen cada checklist.
create table if not exists checklist_items (
  id           uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references checklists(id) on delete cascade,
  tarea        text not null,
  obligatorio  boolean not null default true,
  orden        int not null
);

-- Registro de ejecución de un checklist sobre una máquina (HU06).
create table if not exists registros_checklist (
  id                uuid primary key default gen_random_uuid(),
  maquina_id        uuid not null references maquinas(id),
  checklist_id      uuid not null references checklists(id),
  usuario_id        uuid references usuarios(id),
  usuario_nombre    text not null,
  fecha_ejecucion   timestamptz not null default now(),
  resultado_general text not null check (resultado_general in ('Conforme', 'No Conforme')),
  observaciones     text,
  firma_digital     text
);

-- Resultado de cada ítem del checklist al momento de la ejecución (snapshot de la tarea).
create table if not exists registro_items (
  id                 uuid primary key default gen_random_uuid(),
  registro_id        uuid not null references registros_checklist(id) on delete cascade,
  checklist_item_id  uuid references checklist_items(id),
  tarea              text not null,
  obligatorio        boolean not null default true,
  orden              int not null,
  resultado          text not null default 'pendiente' check (resultado in ('cumple', 'no_cumple', 'pendiente'))
);

-- Mantenimientos correctivos registrados fuera de un checklist (HU14).
create table if not exists mantenimientos_correctivos (
  id             uuid primary key default gen_random_uuid(),
  maquina_id     uuid not null references maquinas(id),
  descripcion    text not null,
  repuestos      text,
  observaciones  text,
  registrado_por text,
  fecha_registro timestamptz not null default now()
);

-- Contador para códigos legibles y secuenciales (M1, INC1...) seguros ante concurrencia.
create table if not exists contadores (
  nombre text primary key,
  valor  int  not null default 0
);

-- ---------- Función de contador atómico ----------

create or replace function siguiente_valor(p_nombre text)
returns int
language sql
as $$
  insert into contadores (nombre, valor) values (p_nombre, 1)
  on conflict (nombre) do update set valor = contadores.valor + 1
  returning valor;
$$;

-- ---------- Row Level Security ----------
-- Esquema de demo/académico: acceso abierto para anon/authenticated.
-- Para producción, restringir por rol (p.ej. solo administrador en usuarios).

alter table usuarios                enable row level security;
alter table maquinas                enable row level security;
alter table incidencias             enable row level security;
alter table alertas                 enable row level security;
alter table checklists              enable row level security;
alter table checklist_items         enable row level security;
alter table registros_checklist     enable row level security;
alter table registro_items          enable row level security;
alter table mantenimientos_correctivos enable row level security;
alter table contadores              enable row level security;

create policy "demo_all_usuarios"                on usuarios                for all using (true) with check (true);
create policy "demo_all_maquinas"                on maquinas                for all using (true) with check (true);
create policy "demo_all_incidencias"             on incidencias             for all using (true) with check (true);
create policy "demo_all_alertas"                 on alertas                 for all using (true) with check (true);
create policy "demo_all_checklists"              on checklists              for all using (true) with check (true);
create policy "demo_all_checklist_items"         on checklist_items         for all using (true) with check (true);
create policy "demo_all_registros_checklist"     on registros_checklist     for all using (true) with check (true);
create policy "demo_all_registro_items"          on registro_items          for all using (true) with check (true);
create policy "demo_all_mantenimientos_correctivos" on mantenimientos_correctivos for all using (true) with check (true);
create policy "demo_all_contadores"              on contadores              for all using (true) with check (true);

grant select, insert, update, delete on
  usuarios, maquinas, incidencias, alertas, checklists, checklist_items,
  registros_checklist, registro_items, mantenimientos_correctivos, contadores
to anon, authenticated;

grant execute on function siguiente_valor(text) to anon, authenticated;