-- Ninho do Cael · Migration 3: Row Level Security (SDD, seções 4 e 33)
--
-- Modelo: todo dado operacional pertence a um household. Membros (owner e
-- collaborator) leem e escrevem dentro do próprio household; exclusão física
-- e áreas sensíveis (convites, configurações, sincronização) são do owner.
-- O service_role (somente servidor) ignora RLS por definição.

-- ---------------------------------------------------------------------------
-- Funções auxiliares (security definer para evitar recursão nas policies)
-- ---------------------------------------------------------------------------
create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select household_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select role = 'owner'::public.papel_perfil
       from public.profiles
      where id = auth.uid()),
    false
  );
$$;

revoke all on function public.current_household_id() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.current_household_id() to authenticated;
grant execute on function public.is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- Grants de schema/tabelas (RLS restringe as linhas)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;

grant select, update on public.households to authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant select, insert, update on public.babies to authenticated;
grant select, insert, update on public.household_invites to authenticated;
grant select, update on public.household_settings to authenticated;
grant select, insert, update, delete on public.needs to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.need_products to authenticated;
grant select, insert, update, delete on public.purchases to authenticated;
grant select, insert, update, delete on public.purchase_items to authenticated;
grant select, insert, update, delete on public.inventory_items to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.decisions to authenticated;
grant select, insert, update, delete on public.need_tasks to authenticated;
grant select, insert, update, delete on public.need_decisions to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant select, insert, update on public.sync_runs to authenticated;
grant select, insert, update on public.sync_queue to authenticated;
grant select, insert, update on public.sync_conflicts to authenticated;

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------
alter table public.households enable row level security;

create policy "membros veem o proprio household"
  on public.households for select to authenticated
  using (id = public.current_household_id());

create policy "owner atualiza o household"
  on public.households for update to authenticated
  using (id = public.current_household_id() and public.is_owner())
  with check (id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "membros veem perfis do household"
  on public.profiles for select to authenticated
  using (household_id = public.current_household_id());

create policy "cada um atualiza o proprio perfil"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- babies
-- ---------------------------------------------------------------------------
alter table public.babies enable row level security;

create policy "membros veem bebes"
  on public.babies for select to authenticated
  using (household_id = public.current_household_id());

create policy "membros cadastram bebes"
  on public.babies for insert to authenticated
  with check (household_id = public.current_household_id());

create policy "membros atualizam bebes"
  on public.babies for update to authenticated
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- household_invites — área do owner (seção 4.2: colaboradora não gerencia)
-- ---------------------------------------------------------------------------
alter table public.household_invites enable row level security;

create policy "owner ve convites"
  on public.household_invites for select to authenticated
  using (household_id = public.current_household_id() and public.is_owner());

create policy "owner cria convites"
  on public.household_invites for insert to authenticated
  with check (household_id = public.current_household_id() and public.is_owner());

create policy "owner revoga convites"
  on public.household_invites for update to authenticated
  using (household_id = public.current_household_id() and public.is_owner())
  with check (household_id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- household_settings — leitura para membros, escrita do owner (seção 4.2)
-- ---------------------------------------------------------------------------
alter table public.household_settings enable row level security;

create policy "membros veem configuracoes"
  on public.household_settings for select to authenticated
  using (household_id = public.current_household_id());

create policy "owner atualiza configuracoes"
  on public.household_settings for update to authenticated
  using (household_id = public.current_household_id() and public.is_owner())
  with check (household_id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- Tabelas de domínio: leitura/criação/edição para membros, DELETE só owner
-- (exclusão do dia a dia é lógica, via archived_at — seção 10.10)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'needs', 'products', 'need_products', 'purchases', 'purchase_items',
    'inventory_items', 'tasks', 'decisions', 'need_tasks', 'need_decisions'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "membros veem" on public.%I for select to authenticated
         using (household_id = public.current_household_id())', t);
    execute format(
      'create policy "membros criam" on public.%I for insert to authenticated
         with check (household_id = public.current_household_id())', t);
    execute format(
      'create policy "membros atualizam" on public.%I for update to authenticated
         using (household_id = public.current_household_id())
         with check (household_id = public.current_household_id())', t);
    execute format(
      'create policy "owner exclui definitivamente" on public.%I for delete to authenticated
         using (household_id = public.current_household_id() and public.is_owner())', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- activity_logs — imutável: membros leem e registram; ninguém edita/apaga
-- ---------------------------------------------------------------------------
alter table public.activity_logs enable row level security;

create policy "membros veem atividade"
  on public.activity_logs for select to authenticated
  using (household_id = public.current_household_id());

create policy "membros registram atividade"
  on public.activity_logs for insert to authenticated
  with check (household_id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- Sincronização — leitura para membros; escrita pelo owner (seção 4.1)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['sync_runs', 'sync_queue', 'sync_conflicts']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "membros veem sync" on public.%I for select to authenticated
         using (household_id = public.current_household_id())', t);
    execute format(
      'create policy "owner escreve sync" on public.%I for insert to authenticated
         with check (household_id = public.current_household_id() and public.is_owner())', t);
    execute format(
      'create policy "owner atualiza sync" on public.%I for update to authenticated
         using (household_id = public.current_household_id() and public.is_owner())
         with check (household_id = public.current_household_id())', t);
  end loop;
end;
$$;
