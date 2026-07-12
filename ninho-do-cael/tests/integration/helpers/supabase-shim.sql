-- Shim mínimo do ambiente Supabase para testes locais com Postgres puro.
-- Reproduz o que a plataforma provê antes das nossas migrations:
-- roles (anon/authenticated/service_role), schema auth, auth.users e auth.uid().

do $$
begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$$;

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key,
  email text unique,
  created_at timestamptz not null default now()
);

-- Igual ao Supabase: lê o sub das claims do JWT injetadas na sessão.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'),
    ''
  )::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant select on auth.users to service_role;
