-- ============================================================
-- FixFlow — Esquema de base de datos para Supabase (PostgreSQL)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Tablas ----------

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


alter table maquinas    enable row level security;
alter table incidencias enable row level security;
alter table contadores  enable row level security;

create policy "demo_all_maquinas"    on maquinas    for all using (true) with check (true);
create policy "demo_all_incidencias" on incidencias for all using (true) with check (true);
create policy "demo_all_contadores"  on contadores  for all using (true) with check (true);

grant select, insert, update, delete on maquinas, incidencias, contadores to anon, authenticated;
grant execute on function siguiente_valor(text) to anon, authenticated;
