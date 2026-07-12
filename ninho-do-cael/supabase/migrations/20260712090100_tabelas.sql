-- Ninho do Cael · Migration 2: tabelas, índices e triggers (SDD, seção 8)

-- Trigger de updated_at compartilhado
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Sao_Paulo',
  currency text not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.households
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  display_name text not null,
  role public.papel_perfil not null default 'collaborator',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_household_idx on public.profiles (household_id);

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- babies
-- ---------------------------------------------------------------------------
create table public.babies (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  due_date date,
  planned_birth_type text,
  maternity text,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index babies_household_idx on public.babies (household_id);

create trigger set_updated_at before update on public.babies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- household_invites (colaboradora entra por convite — seção 27)
-- ---------------------------------------------------------------------------
create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  email text not null,
  role public.papel_perfil not null default 'collaborator',
  token uuid not null unique default gen_random_uuid(),
  invited_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index household_invites_household_idx on public.household_invites (household_id);

-- ---------------------------------------------------------------------------
-- needs (seção 8.1)
-- ---------------------------------------------------------------------------
create table public.needs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  type public.tipo_necessidade not null default 'produto',
  audience public.publico_necessidade not null default 'bebe',
  category public.categoria not null,
  priority public.prioridade not null default 'media',
  criticality public.criticidade not null default 'media',
  phase public.fase_uso not null default 'antes_do_parto',
  decision_status public.status_decisao_necessidade not null default 'precisa_pesquisar',
  acquisition_status public.status_aquisicao not null default 'aguardar',
  logistics_status public.status_logistico not null default 'nao_aplicavel',
  readiness_status public.status_prontidao not null default 'pendente',
  responsible public.responsavel_tipo not null default 'casal',
  required_quantity numeric(10, 2) check (required_quantity is null or required_quantity >= 0),
  available_quantity numeric(10, 2) check (available_quantity is null or available_quantity >= 0),
  unit text,
  estimated_price numeric(12, 2) check (estimated_price is null or estimated_price >= 0),
  paid_price numeric(12, 2) check (paid_price is null or paid_price >= 0),
  due_date date,
  original_content text,
  audit_notes text,
  original_notion_url text,
  notion_page_id text unique,
  notion_url text,
  notion_last_edited_time timestamptz,
  last_synced_at timestamptz,
  sync_hash text,
  sync_status public.status_sync not null default 'not_linked',
  archived_at timestamptz,
  archived_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index needs_household_idx on public.needs (household_id) where archived_at is null;
create index needs_category_idx on public.needs (household_id, category);
create index needs_phase_idx on public.needs (household_id, phase);
create index needs_criticality_idx on public.needs (household_id, criticality);

create trigger set_updated_at before update on public.needs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products (seção 8.1)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  family text,
  brand text,
  model text,
  variant text,
  color text,
  size_label text,
  status text not null default 'candidato'
    check (status in ('candidato', 'escolhido', 'descartado')),
  store text,
  url text,
  reference_price numeric(12, 2) check (reference_price is null or reference_price >= 0),
  paid_price numeric(12, 2) check (paid_price is null or paid_price >= 0),
  compatibility text,
  reason text,
  original_content text,
  notion_page_id text unique,
  notion_url text,
  notion_last_edited_time timestamptz,
  last_synced_at timestamptz,
  sync_hash text,
  sync_status public.status_sync not null default 'not_linked',
  archived_at timestamptz,
  archived_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_household_idx on public.products (household_id) where archived_at is null;

create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- need_products (N:N com preferido — seção 8.1)
-- ---------------------------------------------------------------------------
create table public.need_products (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  need_id uuid not null references public.needs (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  is_preferred boolean not null default false,
  created_at timestamptz not null default now(),
  unique (need_id, product_id)
);

create index need_products_household_idx on public.need_products (household_id);
create index need_products_need_idx on public.need_products (need_id);
create index need_products_product_idx on public.need_products (product_id);

-- ---------------------------------------------------------------------------
-- purchases (seção 8.1; total = subtotal - desconto + frete, seção 10.9)
-- ---------------------------------------------------------------------------
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  type public.tipo_compra not null default 'online',
  status public.status_compra not null default 'confirmada',
  supplier text,
  payment_method public.forma_pagamento,
  order_reference text,
  tracking_code text,
  purchased_at date,
  expected_delivery_at date,
  delivered_at date,
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  shipping numeric(12, 2) not null default 0 check (shipping >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  notes text,
  notion_page_id text unique,
  notion_url text,
  notion_last_edited_time timestamptz,
  last_synced_at timestamptz,
  sync_hash text,
  sync_status public.status_sync not null default 'not_linked',
  archived_at timestamptz,
  archived_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchases_household_idx on public.purchases (household_id) where archived_at is null;
create index purchases_status_idx on public.purchases (household_id, status);

create trigger set_updated_at before update on public.purchases
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- purchase_items (seção 8.1, com rateios)
-- ---------------------------------------------------------------------------
create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  purchase_id uuid not null references public.purchases (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  need_id uuid references public.needs (id) on delete set null,
  description text not null,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  allocated_discount numeric(12, 2) not null default 0 check (allocated_discount >= 0),
  allocated_shipping numeric(12, 2) not null default 0 check (allocated_shipping >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchase_items_household_idx on public.purchase_items (household_id);
create index purchase_items_purchase_idx on public.purchase_items (purchase_id);
create index purchase_items_need_idx on public.purchase_items (need_id);

create trigger set_updated_at before update on public.purchase_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- inventory_items (seção 8.1)
-- ---------------------------------------------------------------------------
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  need_id uuid references public.needs (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  quantity numeric(10, 2) not null default 1 check (quantity >= 0),
  condition public.condicao_item not null default 'novo',
  readiness_status public.status_prontidao not null default 'pendente',
  location text,
  origin public.origem_item not null default 'compra',
  expires_at date,
  batch text,
  notes text,
  notion_page_id text unique,
  notion_url text,
  notion_last_edited_time timestamptz,
  last_synced_at timestamptz,
  sync_hash text,
  sync_status public.status_sync not null default 'not_linked',
  archived_at timestamptz,
  archived_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inventory_household_idx on public.inventory_items (household_id) where archived_at is null;
create index inventory_readiness_idx on public.inventory_items (household_id, readiness_status);
create index inventory_need_idx on public.inventory_items (need_id);

create trigger set_updated_at before update on public.inventory_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tasks (seção 8.1)
-- ---------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  type public.tipo_tarefa not null default 'tarefa',
  category public.categoria,
  status public.status_tarefa not null default 'planejada',
  responsible public.responsavel_tipo not null default 'casal',
  due_date date,
  window_start date,
  window_end date,
  estimated_cost numeric(12, 2) check (estimated_cost is null or estimated_cost >= 0),
  actual_cost numeric(12, 2) check (actual_cost is null or actual_cost >= 0),
  depends_on_task_id uuid references public.tasks (id) on delete set null,
  blocked_reason text,
  completion_criteria text,
  completion_notes text,
  completed_at timestamptz,
  original_content text,
  notion_page_id text unique,
  notion_url text,
  notion_last_edited_time timestamptz,
  last_synced_at timestamptz,
  sync_hash text,
  sync_status public.status_sync not null default 'not_linked',
  archived_at timestamptz,
  archived_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_janela_valida check (
    window_start is null or window_end is null or window_start <= window_end
  ),
  constraint tasks_concluida_tem_data check (
    status <> 'concluida' or completed_at is not null
  )
);

create index tasks_household_idx on public.tasks (household_id) where archived_at is null;
create index tasks_status_idx on public.tasks (household_id, status);
create index tasks_due_idx on public.tasks (household_id, due_date);

create trigger set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- decisions (seções 8.1, 10.11 e 21)
-- ---------------------------------------------------------------------------
create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  type public.tipo_decisao not null default 'familiar',
  status public.status_registro_decisao not null default 'pendente',
  responsible public.responsavel_tipo not null default 'casal',
  confidence public.confianca_decisao,
  decided_at date,
  due_date date,
  conclusion text,
  rationale text,
  source text,
  impact text,
  pending_question text,
  original_content text,
  notion_page_id text unique,
  notion_url text,
  notion_last_edited_time timestamptz,
  last_synced_at timestamptz,
  sync_hash text,
  sync_status public.status_sync not null default 'not_linked',
  archived_at timestamptz,
  archived_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Decisão médica não pode ser "decidida" sem conclusão registrada (10.11).
  constraint decisao_medica_exige_conclusao check (
    not (
      type = 'medica'
      and status = 'decidida'
      and (conclusion is null or btrim(conclusion) = '')
    )
  )
);

create index decisions_household_idx on public.decisions (household_id) where archived_at is null;
create index decisions_status_idx on public.decisions (household_id, status);

create trigger set_updated_at before update on public.decisions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Relações necessidade ↔ tarefa / decisão (seções 16 e 39)
-- ---------------------------------------------------------------------------
create table public.need_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  need_id uuid not null references public.needs (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (need_id, task_id)
);

create index need_tasks_household_idx on public.need_tasks (household_id);

create table public.need_decisions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  need_id uuid not null references public.needs (id) on delete cascade,
  decision_id uuid not null references public.decisions (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (need_id, decision_id)
);

create index need_decisions_household_idx on public.need_decisions (household_id);

-- ---------------------------------------------------------------------------
-- activity_logs (seções 8.1 e 26) — imutável
-- ---------------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action public.acao_atividade not null,
  changes jsonb,
  origin public.origem_atividade not null default 'app',
  created_at timestamptz not null default now()
);

create index activity_logs_household_idx on public.activity_logs (household_id, created_at desc);
create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- sync_runs / sync_queue / sync_conflicts (seções 7.8–7.10 e 8.1)
-- ---------------------------------------------------------------------------
create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  direction public.direcao_sync not null,
  status public.status_sync_run not null default 'em_execucao',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_count integer not null default 0,
  failed_count integer not null default 0,
  error text,
  created_at timestamptz not null default now()
);

create index sync_runs_household_idx on public.sync_runs (household_id, started_at desc);

create table public.sync_queue (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  operation public.operacao_sync not null,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  status public.status_fila_sync not null default 'pendente',
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sync_queue_household_idx on public.sync_queue (household_id, status);
create index sync_queue_pending_idx on public.sync_queue (next_attempt_at)
  where status in ('pendente', 'falha');

create trigger set_updated_at before update on public.sync_queue
  for each row execute function public.set_updated_at();

create table public.sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  field text not null,
  app_value jsonb,
  notion_value jsonb,
  app_edited_at timestamptz,
  notion_edited_at timestamptz,
  status public.status_conflito not null default 'aberto',
  resolution public.resolucao_conflito,
  resolved_value jsonb,
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conflito_resolvido_completo check (
    status <> 'resolvido' or (resolution is not null and resolved_at is not null)
  )
);

create unique index sync_conflicts_abertos_unicos
  on public.sync_conflicts (entity_type, entity_id, field)
  where status = 'aberto';

create index sync_conflicts_household_idx on public.sync_conflicts (household_id, status);

create trigger set_updated_at before update on public.sync_conflicts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- household_settings (seção 8.1)
-- ---------------------------------------------------------------------------
create table public.household_settings (
  household_id uuid primary key references public.households (id) on delete cascade,
  theme text not null default 'claro',
  show_future_items boolean not null default true,
  default_home text not null default '/app/dashboard',
  budget_alert_limit numeric(12, 2) check (budget_alert_limit is null or budget_alert_limit >= 0),
  sync_enabled boolean not null default false,
  medical_disclaimer_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.household_settings
  for each row execute function public.set_updated_at();
