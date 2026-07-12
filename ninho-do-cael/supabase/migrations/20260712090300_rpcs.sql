-- Ninho do Cael · Migration 4: RPCs de onboarding e convite (SDD, seção 27)
--
-- Ambas rodam como security definer porque o usuário recém-autenticado ainda
-- não tem perfil (e, portanto, nenhuma policy o alcança). São as únicas
-- portas de entrada para criar household/perfil.

-- Owner confirma família, Cael e configurações no primeiro acesso.
create or replace function public.create_household_with_baby(
  p_household_name text,
  p_display_name text,
  p_baby_name text,
  p_due_date date default null,
  p_birth_type text default null,
  p_maternity text default null,
  p_city text default null,
  p_state text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
begin
  if v_user_id is null then
    raise exception 'É preciso estar autenticado.' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles where id = v_user_id) then
    raise exception 'Este usuário já pertence a uma família.' using errcode = '23505';
  end if;

  if btrim(coalesce(p_household_name, '')) = ''
     or btrim(coalesce(p_display_name, '')) = ''
     or btrim(coalesce(p_baby_name, '')) = '' then
    raise exception 'Nome da família, seu nome e o nome do bebê são obrigatórios.'
      using errcode = '23514';
  end if;

  insert into public.households (name)
  values (btrim(p_household_name))
  returning id into v_household_id;

  insert into public.profiles (id, household_id, display_name, role)
  values (v_user_id, v_household_id, btrim(p_display_name), 'owner');

  insert into public.babies (
    household_id, name, due_date, planned_birth_type, maternity, city, state
  )
  values (
    v_household_id, btrim(p_baby_name), p_due_date, p_birth_type,
    p_maternity, p_city, p_state
  );

  insert into public.household_settings (household_id)
  values (v_household_id);

  insert into public.activity_logs (
    household_id, actor_profile_id, entity_type, entity_id, action, origin, changes
  )
  values (
    v_household_id, v_user_id, 'household', v_household_id, 'criacao', 'app',
    jsonb_build_object('name', btrim(p_household_name))
  );

  return v_household_id;
end;
$$;

-- Colaboradora entra por convite (token de uso único com validade).
create or replace function public.accept_household_invite(
  p_token uuid,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_invite public.household_invites%rowtype;
begin
  if v_user_id is null then
    raise exception 'É preciso estar autenticado.' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles where id = v_user_id) then
    raise exception 'Este usuário já pertence a uma família.' using errcode = '23505';
  end if;

  if btrim(coalesce(p_display_name, '')) = '' then
    raise exception 'Informe seu nome.' using errcode = '23514';
  end if;

  select * into v_invite
    from public.household_invites
   where token = p_token
   for update;

  if not found then
    raise exception 'Convite não encontrado.' using errcode = 'P0002';
  end if;

  if v_invite.accepted_at is not null then
    raise exception 'Este convite já foi utilizado.' using errcode = '23505';
  end if;

  if v_invite.revoked_at is not null then
    raise exception 'Este convite foi revogado.' using errcode = '42501';
  end if;

  if v_invite.expires_at < now() then
    raise exception 'Este convite expirou. Peça um novo.' using errcode = '22000';
  end if;

  insert into public.profiles (id, household_id, display_name, role)
  values (v_user_id, v_invite.household_id, btrim(p_display_name), v_invite.role);

  update public.household_invites
     set accepted_at = now(), accepted_by = v_user_id
   where id = v_invite.id;

  insert into public.activity_logs (
    household_id, actor_profile_id, entity_type, entity_id, action, origin, changes
  )
  values (
    v_invite.household_id, v_user_id, 'profile', v_user_id, 'criacao', 'app',
    jsonb_build_object('role', v_invite.role, 'via', 'convite')
  );

  return v_invite.household_id;
end;
$$;

revoke all on function public.create_household_with_baby(text, text, text, date, text, text, text, text) from public;
revoke all on function public.accept_household_invite(uuid, text) from public;
grant execute on function public.create_household_with_baby(text, text, text, date, text, text, text, text) to authenticated;
grant execute on function public.accept_household_invite(uuid, text) to authenticated;
