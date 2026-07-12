-- ============================================================================
-- Ninho do Cael · SEED DE DESENVOLVIMENTO (SDD, seção 38)
-- ============================================================================
-- APENAS PARA AMBIENTE LOCAL (supabase start / supabase db reset).
-- NUNCA execute em produção: insere usuários fictícios em auth.users e dados
-- de demonstração claramente marcados com "(SEED DEV)".
-- Idempotente: pode rodar mais de uma vez sem duplicar.
-- ============================================================================

-- Usuários de desenvolvimento (login local via Inbucket do Supabase CLI).
insert into auth.users (id, email)
values
  ('a0000000-0000-4000-8000-000000000001', 'alisson.dev@ninho.local'),
  ('a0000000-0000-4000-8000-000000000002', 'duda.dev@ninho.local')
on conflict (id) do nothing;

-- Família, perfis, bebê e configurações -------------------------------------
insert into public.households (id, name)
values ('d0000000-0000-4000-8000-000000000001', 'Ninho do Cael (SEED DEV)')
on conflict (id) do nothing;

insert into public.profiles (id, household_id, display_name, role)
values
  ('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Alisson', 'owner'),
  ('a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'Duda', 'collaborator')
on conflict (id) do nothing;

insert into public.babies (id, household_id, name, due_date, planned_birth_type, maternity, city, state)
values (
  'b0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000001',
  'Cael', '2026-11-15', 'Cesárea', 'Santa Luiza / Unimed', 'Itajaí', 'SC'
)
on conflict (id) do nothing;

insert into public.household_settings (household_id)
values ('d0000000-0000-4000-8000-000000000001')
on conflict (household_id) do nothing;

-- Convite pendente (aparece em Configurações > Família) ----------------------
insert into public.household_invites (id, household_id, email, token, invited_by, expires_at)
values (
  'c0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000001',
  'convidada.exemplo@ninho.local',
  'c0000000-0000-4000-8000-00000000c0fe',
  'a0000000-0000-4000-8000-000000000001',
  now() + interval '14 days'
)
on conflict (id) do nothing;

-- ============================================================================
-- Necessidades: 32 itens cobrindo as 13 categorias, fases e status variados
-- (ids: e0…NN). Inclui item futuro, crítico, "já possui", "não comprar",
-- decisão profissional pendente e estados de sincronização diversos.
-- ============================================================================
insert into public.needs (
  id, household_id, title, type, audience, category, priority, criticality,
  phase, decision_status, acquisition_status, logistics_status,
  readiness_status, responsible, required_quantity, available_quantity, unit,
  estimated_price, paid_price, due_date, sync_status
)
values
  -- Sono
  ('e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'Berço montessoriano', 'produto', 'bebe', 'sono', 'alta', 'critica',
   'antes_do_parto', 'escolhido', 'comprado', 'entregue', 'precisa_montar',
   'pai', 1, 1, 'un', 1200.00, 1149.90, '2026-10-15', 'synced'),
  ('e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'Colchão do berço', 'produto', 'bebe', 'sono', 'alta', 'critica',
   'antes_do_parto', 'escolhido', 'aguardando_compra', 'nao_confirmado', 'pendente',
   'casal', 1, 0, 'un', 350.00, null, '2026-10-20', 'pending_push'),
  ('e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'Saco de dormir RN', 'produto', 'bebe', 'sono', 'media', 'media',
   'meses_0_3', 'pesquisando', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'mae', 2, 0, 'un', 160.00, null, null, 'not_linked'),

  -- Amamentação
  ('e0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001',
   'Almofada de amamentação', 'produto', 'mae', 'amamentacao', 'alta', 'alta',
   'antes_do_parto', 'escolhido', 'comprado', 'entregue', 'pronto_para_uso',
   'mae', 1, 1, 'un', 180.00, 165.00, '2026-11-01', 'synced'),
  ('e0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001',
   'Bomba tira-leite', 'produto', 'mae', 'amamentacao', 'media', 'media',
   'meses_0_3', 'comparando', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'mae', 1, 0, 'un', 450.00, null, null, 'not_linked'),

  -- Higiene
  ('e0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000001',
   'Banheira com suporte', 'produto', 'bebe', 'higiene', 'alta', 'alta',
   'antes_do_parto', 'escolhido', 'comprado', 'aguardando_envio', 'pendente',
   'casal', 1, 0, 'un', 320.00, 289.00, '2026-11-05', 'pending_pull'),
  ('e0000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000001',
   'Kit cuidados (tesoura, escova, aspirador nasal)', 'produto', 'bebe', 'higiene',
   'media', 'media', 'antes_do_parto', 'precisa_pesquisar', 'aguardar',
   'nao_aplicavel', 'nao_aplicavel', 'mae', 1, 0, 'kit', 120.00, null, null, 'not_linked'),
  ('e0000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000001',
   'Pomada para assaduras', 'consumivel', 'bebe', 'higiene', 'alta', 'alta',
   'continuo', 'escolhido', 'aguardando_compra', 'nao_confirmado', 'nao_aplicavel',
   'casal', 4, 1, 'un', 35.00, null, '2026-11-10', 'not_linked'),

  -- Transporte
  ('e0000000-0000-4000-8000-000000000009', 'd0000000-0000-4000-8000-000000000001',
   'Bebê conforto (0–13 kg)', 'produto', 'bebe', 'transporte', 'alta', 'critica',
   'antes_do_parto', 'escolhido', 'comprado', 'enviado', 'precisa_instalar',
   'pai', 1, 0, 'un', 1400.00, 1259.10, '2026-10-30', 'synced'),
  ('e0000000-0000-4000-8000-000000000010', 'd0000000-0000-4000-8000-000000000001',
   'Carrinho de passeio', 'produto', 'bebe', 'transporte', 'media', 'alta',
   'meses_0_3', 'comparando', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'casal', 1, 0, 'un', 2200.00, null, null, 'error'),
  ('e0000000-0000-4000-8000-000000000011', 'd0000000-0000-4000-8000-000000000001',
   'Canguru ergonômico', 'produto', 'bebe', 'transporte', 'baixa', 'baixa',
   'meses_3_6', 'adiado', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'casal', 1, 0, 'un', 380.00, null, null, 'not_linked'),

  -- Roupas
  ('e0000000-0000-4000-8000-000000000012', 'd0000000-0000-4000-8000-000000000001',
   'Bodies manga curta RN', 'produto', 'bebe', 'roupas', 'alta', 'alta',
   'antes_do_parto', 'escolhido', 'comprado', 'entregue', 'precisa_lavar',
   'mae', 8, 8, 'un', 240.00, 199.90, '2026-11-01', 'synced'),
  ('e0000000-0000-4000-8000-000000000013', 'd0000000-0000-4000-8000-000000000001',
   'Macacões RN', 'produto', 'bebe', 'roupas', 'alta', 'alta',
   'antes_do_parto', 'escolhido', 'comprado', 'enviado', 'precisa_lavar',
   'mae', 6, 4, 'un', 300.00, 225.10, '2026-11-01', 'conflict'),
  ('e0000000-0000-4000-8000-000000000014', 'd0000000-0000-4000-8000-000000000001',
   'Roupas 3–6 meses', 'produto', 'bebe', 'roupas', 'baixa', 'baixa',
   'meses_3_6', 'adiado', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'mae', 10, 0, 'un', 400.00, null, null, 'not_linked'),

  -- Fraldas
  ('e0000000-0000-4000-8000-000000000015', 'd0000000-0000-4000-8000-000000000001',
   'Fraldas RN', 'consumivel', 'bebe', 'fraldas', 'alta', 'critica',
   'antes_do_parto', 'escolhido', 'aguardando_compra', 'nao_confirmado', 'nao_aplicavel',
   'casal', 4, 1, 'pacote', 89.90, null, '2026-11-08', 'conflict'),
  ('e0000000-0000-4000-8000-000000000016', 'd0000000-0000-4000-8000-000000000001',
   'Lenços umedecidos', 'consumivel', 'bebe', 'fraldas', 'media', 'media',
   'continuo', 'escolhido', 'elegivel_para_cha', 'nao_aplicavel', 'nao_aplicavel',
   'casal', 12, 2, 'pacote', 144.00, null, null, 'not_linked'),

  -- Maternidade
  ('e0000000-0000-4000-8000-000000000017', 'd0000000-0000-4000-8000-000000000001',
   'Mala da maternidade (mãe e bebê)', 'servico', 'mae', 'maternidade', 'alta', 'critica',
   'antes_do_parto', 'escolhido', 'ja_possui', 'nao_aplicavel', 'precisa_validar',
   'mae', 1, 1, 'un', null, null, '2026-11-01', 'not_linked'),
  ('e0000000-0000-4000-8000-000000000018', 'd0000000-0000-4000-8000-000000000001',
   'Saída de maternidade', 'produto', 'bebe', 'maternidade', 'alta', 'alta',
   'antes_do_parto', 'escolhido', 'comprado', 'entregue', 'precisa_lavar',
   'mae', 1, 1, 'un', 150.00, 139.90, '2026-11-01', 'synced'),

  -- Pós-parto
  ('e0000000-0000-4000-8000-000000000019', 'd0000000-0000-4000-8000-000000000001',
   'Absorventes pós-parto', 'consumivel', 'mae', 'pos_parto', 'alta', 'alta',
   'antes_do_parto', 'escolhido', 'aguardando_compra', 'nao_confirmado', 'nao_aplicavel',
   'mae', 3, 0, 'pacote', 60.00, null, '2026-11-08', 'not_linked'),
  ('e0000000-0000-4000-8000-000000000020', 'd0000000-0000-4000-8000-000000000001',
   'Cinta pós-cesárea', 'produto', 'mae', 'pos_parto', 'media', 'media',
   'antes_do_parto', 'decisao_profissional_pendente', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'obstetra', 1, 0, 'un', 120.00, null, null, 'not_linked'),

  -- Quarto
  ('e0000000-0000-4000-8000-000000000021', 'd0000000-0000-4000-8000-000000000001',
   'Cômoda com trocador', 'produto', 'bebe', 'quarto', 'alta', 'alta',
   'antes_do_parto', 'escolhido', 'ja_possui', 'nao_aplicavel', 'pronto_para_uso',
   'casal', 1, 1, 'un', null, null, null, 'not_linked'),
  ('e0000000-0000-4000-8000-000000000022', 'd0000000-0000-4000-8000-000000000001',
   'Luminária de luz quente', 'produto', 'casa', 'quarto', 'baixa', 'media',
   'antes_do_parto', 'pesquisando', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'pai', 1, 0, 'un', 180.00, null, null, 'not_linked'),
  ('e0000000-0000-4000-8000-000000000023', 'd0000000-0000-4000-8000-000000000001',
   'Babá eletrônica', 'produto', 'casa', 'quarto', 'media', 'media',
   'meses_0_3', 'comparando', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'pai', 1, 0, 'un', 600.00, null, null, 'not_linked'),

  -- Desenvolvimento
  ('e0000000-0000-4000-8000-000000000024', 'd0000000-0000-4000-8000-000000000001',
   'Tapete de atividades', 'produto', 'bebe', 'desenvolvimento', 'baixa', 'baixa',
   'meses_3_6', 'escolhido', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'casal', 1, 0, 'un', 250.00, null, null, 'not_linked'),
  ('e0000000-0000-4000-8000-000000000025', 'd0000000-0000-4000-8000-000000000001',
   'Cadeirão de alimentação', 'produto', 'bebe', 'desenvolvimento', 'baixa', 'media',
   'meses_6_12', 'precisa_pesquisar', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'casal', 1, 0, 'un', 700.00, null, null, 'not_linked'),

  -- Segurança
  ('e0000000-0000-4000-8000-000000000026', 'd0000000-0000-4000-8000-000000000001',
   'Protetores de tomada', 'produto', 'casa', 'seguranca', 'baixa', 'baixa',
   'apos_12_meses', 'escolhido', 'nao_comprar', 'nao_aplicavel', 'nao_aplicavel',
   'pai', 1, 0, 'kit', 30.00, null, null, 'not_linked'),
  ('e0000000-0000-4000-8000-000000000027', 'd0000000-0000-4000-8000-000000000001',
   'Grade de proteção da cama', 'produto', 'bebe', 'seguranca', 'baixa', 'media',
   'apos_12_meses', 'adiado', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'casal', 1, 0, 'un', 220.00, null, null, 'not_linked'),

  -- Documentos
  ('e0000000-0000-4000-8000-000000000028', 'd0000000-0000-4000-8000-000000000001',
   'Certidão de nascimento', 'documento', 'bebe', 'documentos', 'alta', 'critica',
   'meses_0_3', 'escolhido', 'nao_comprar', 'nao_aplicavel', 'nao_aplicavel',
   'pai', 1, 0, 'un', null, null, null, 'not_linked'),
  ('e0000000-0000-4000-8000-000000000029', 'd0000000-0000-4000-8000-000000000001',
   'Inclusão no plano de saúde', 'documento', 'bebe', 'documentos', 'alta', 'critica',
   'meses_0_3', 'escolhido', 'nao_comprar', 'nao_aplicavel', 'nao_aplicavel',
   'pai', 1, 0, 'un', null, null, '2026-12-15', 'not_linked'),

  -- Alimentação
  ('e0000000-0000-4000-8000-000000000030', 'd0000000-0000-4000-8000-000000000001',
   'Mamadeiras anticólica', 'produto', 'bebe', 'alimentacao', 'media', 'media',
   'meses_0_3', 'decisao_profissional_pendente', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'pediatra', 4, 0, 'un', 200.00, null, null, 'not_linked'),
  ('e0000000-0000-4000-8000-000000000031', 'd0000000-0000-4000-8000-000000000001',
   'Esterilizador', 'produto', 'bebe', 'alimentacao', 'baixa', 'media',
   'meses_0_3', 'pesquisando', 'aguardar', 'nao_aplicavel', 'nao_aplicavel',
   'casal', 1, 0, 'un', 300.00, null, null, 'not_linked'),
  ('e0000000-0000-4000-8000-000000000032', 'd0000000-0000-4000-8000-000000000001',
   'Termômetro digital', 'produto', 'bebe', 'higiene', 'alta', 'alta',
   'antes_do_parto', 'escolhido', 'comprado', 'entregue', 'pronto_para_uso',
   'casal', 1, 1, 'un', 60.00, 49.90, '2026-11-01', 'synced')
on conflict (id) do nothing;

-- ============================================================================
-- Produtos e alternativas (comparação de berços; bebê conforto escolhido)
-- ============================================================================
insert into public.products (
  id, household_id, name, family, brand, model, status, store, url,
  reference_price, paid_price, compatibility, reason, sync_status
)
values
  ('f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'Berço Colo de Mãe', 'berco', 'Colo de Mãe', 'Montessori Oliva', 'escolhido',
   'Loja Ninar', 'https://exemplo.com/berco-oliva', 1200.00, 1149.90,
   'Colchão 130×70', 'Madeira natural, altura regulável', 'synced'),
  ('f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'Berço Sono Leve', 'berco', 'Sono Leve', 'Classic', 'descartado',
   'MegaBebê', 'https://exemplo.com/berco-classic', 980.00, null,
   'Colchão 130×70', 'Acabamento inferior ao escolhido', 'not_linked'),
  ('f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'Bebê conforto ProBaby 360', 'bebe_conforto', 'ProBaby', '360 Isofix', 'escolhido',
   'AutoBaby', 'https://exemplo.com/probaby-360', 1400.00, 1259.10,
   'Isofix; carros 2015+', 'Melhor avaliação de segurança', 'synced'),
  ('f0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001',
   'Carrinho Passeio Leve', 'carrinho', 'Rodinhas', 'Compact', 'candidato',
   'MegaBebê', 'https://exemplo.com/carrinho-compact', 2200.00, null,
   'Compatível com bebê conforto ProBaby', 'Em comparação', 'not_linked')
on conflict (id) do nothing;

insert into public.need_products (id, household_id, need_id, product_id, is_preferred)
values
  ('10000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', true),
  ('10000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000002', false),
  ('10000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000009', 'f0000000-0000-4000-8000-000000000003', true),
  ('10000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000010', 'f0000000-0000-4000-8000-000000000004', false)
on conflict (need_id, product_id) do nothing;

-- ============================================================================
-- Compras: uma com desconto+frete e ENTREGA PARCIAL; outra a caminho
-- (total = subtotal - desconto + frete — seção 10.9)
-- ============================================================================
insert into public.purchases (
  id, household_id, title, type, status, supplier, payment_method,
  order_reference, tracking_code, purchased_at, expected_delivery_at,
  delivered_at, subtotal, discount, shipping, total, notes, sync_status
)
values
  ('20000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'Enxoval de roupas RN', 'online', 'entregue_parcial', 'Loja Ninar', 'cartao_credito',
   'PED-2026-0142', 'BR123456789SE', '2026-07-01', '2026-07-10', null,
   500.00, 50.00, 25.00, 475.00,
   'Bodies entregues; 2 macacões ainda em trânsito.', 'synced'),
  ('20000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'Bebê conforto ProBaby 360', 'online', 'aguardando_envio', 'AutoBaby', 'pix',
   'PED-2026-0198', null, '2026-07-08', '2026-07-20', null,
   1399.00, 139.90, 0.00, 1259.10, null, 'pending_push')
on conflict (id) do nothing;

insert into public.purchase_items (
  id, household_id, purchase_id, product_id, need_id, description, quantity,
  unit_price, allocated_discount, allocated_shipping, total
)
values
  ('30000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   '20000000-0000-4000-8000-000000000001', null, 'e0000000-0000-4000-8000-000000000012',
   'Bodies manga curta RN (kit 8)', 1, 200.00, 20.00, 10.00, 190.00),
  ('30000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   '20000000-0000-4000-8000-000000000001', null, 'e0000000-0000-4000-8000-000000000013',
   'Macacões RN', 6, 50.00, 30.00, 15.00, 285.00),
  ('30000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   '20000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000003',
   'e0000000-0000-4000-8000-000000000009',
   'Bebê conforto ProBaby 360 Isofix', 1, 1399.00, 139.90, 0.00, 1259.10)
on conflict (id) do nothing;

-- ============================================================================
-- Estoque e prontidão: item que PRECISA LAVAR, item pronto, item para montar
-- ============================================================================
insert into public.inventory_items (
  id, household_id, need_id, product_id, name, quantity, condition,
  readiness_status, location, origin, notes, sync_status
)
values
  ('40000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000012', null, 'Bodies manga curta RN', 8, 'novo',
   'precisa_lavar', 'Cômoda do quarto', 'compra',
   'Lavar com sabão neutro antes do uso.', 'synced'),
  ('40000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000013', null, 'Macacões RN (parcial)', 4, 'novo',
   'precisa_lavar', 'Cômoda do quarto', 'compra',
   'Restante da compra ainda em trânsito.', 'synced'),
  ('40000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000032', null, 'Termômetro digital', 1, 'novo',
   'pronto_para_uso', 'Gaveta do trocador', 'compra', null, 'synced'),
  ('40000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001',
   'Berço Colo de Mãe (caixas 1/2 e 2/2)', 1, 'novo',
   'precisa_montar', 'Quarto do Cael', 'compra', null, 'synced'),
  ('40000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000021', null, 'Cômoda com trocador', 1, 'seminovo',
   'pronto_para_uso', 'Quarto do Cael', 'ja_possuia', 'Herdada da prima.', 'not_linked')
on conflict (id) do nothing;

-- ============================================================================
-- Tarefas: inclui TAREFA BLOQUEADA com dependência e motivo
-- ============================================================================
insert into public.tasks (
  id, household_id, title, type, category, status, responsible, due_date,
  estimated_cost, depends_on_task_id, blocked_reason, completion_criteria,
  completed_at, sync_status
)
values
  ('50000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'Receber e conferir o bebê conforto', 'tarefa', 'transporte', 'em_andamento',
   'pai', '2026-07-20', null, null, null,
   'Produto recebido sem avarias e com manual.', null, 'synced'),
  ('50000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'Instalar bebê conforto no carro', 'tarefa', 'transporte', 'bloqueada',
   'pai', '2026-10-30', null, '50000000-0000-4000-8000-000000000001',
   'Aguardando a entrega do bebê conforto.',
   'Instalado no banco traseiro com Isofix e verificado.', null, 'synced'),
  ('50000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'Lavar as primeiras roupas do Cael', 'tarefa', 'roupas', 'planejada',
   'mae', '2026-11-05', null, null, null,
   'Bodies, macacões e saída de maternidade lavados e guardados.', null, 'not_linked'),
  ('50000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001',
   'Escolher pediatra', 'tarefa', 'documentos', 'concluida',
   'casal', '2026-09-30', null, null, null,
   'Pediatra definido e primeira consulta pré-natal pediátrica marcada.',
   '2026-07-05T14:00:00-03:00', 'synced'),
  ('50000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001',
   'Montar o berço', 'servico', 'quarto', 'planejada',
   'pai', '2026-10-25', 150.00, null, null,
   'Berço montado, estável e na altura correta.', null, 'not_linked'),
  ('50000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000001',
   'Incluir Cael no plano de saúde', 'documento', 'documentos', 'planejada',
   'pai', '2026-12-10', null, null, null,
   'Protocolo de inclusão aberto dentro do prazo de 30 dias.', null, 'not_linked')
on conflict (id) do nothing;

-- ============================================================================
-- Decisões: inclui DECISÃO MÉDICA aguardando profissional (sem conclusão)
-- ============================================================================
insert into public.decisions (
  id, household_id, title, type, status, responsible, confidence, decided_at,
  due_date, conclusion, rationale, source, impact, pending_question, sync_status
)
values
  ('60000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'Uso de cinta no pós-cesárea', 'medica', 'aguardando_profissional', 'obstetra',
   null, null, '2026-10-20', null, null, null,
   'Afeta a compra da cinta pós-parto.',
   'Perguntar na consulta de outubro se há recomendação ou restrição.', 'synced'),
  ('60000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'Tema e paleta do quarto', 'familiar', 'decidida', 'casal', 'alta',
   '2026-06-20', null,
   'Montessori com floresta suave: creme, sálvia e madeira.',
   'Combina com a casa e favorece autonomia do bebê.', 'Pesquisa do casal',
   'Direciona compras de decoração e enxoval.', null, 'synced'),
  ('60000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'Mamadeira anticólica: qual marca?', 'medica', 'pendente', 'pediatra',
   null, null, '2026-12-01', null, null, null,
   'Define a compra das mamadeiras e do esterilizador.',
   'Levar opções na primeira consulta com a pediatra.', 'not_linked'),
  ('60000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001',
   'Modelo de bebê conforto', 'seguranca', 'decidida', 'pai', 'alta',
   '2026-07-02', null,
   'ProBaby 360 Isofix.',
   'Melhor nota em testes de segurança e compatível com o carro.',
   'Testes do Inmetro e reviews', 'Item crítico para a alta da maternidade.',
   null, 'synced')
on conflict (id) do nothing;

-- Relações necessidade ↔ tarefa/decisão --------------------------------------
insert into public.need_tasks (id, household_id, need_id, task_id)
values
  ('70000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000009', '50000000-0000-4000-8000-000000000002'),
  ('70000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000012', '50000000-0000-4000-8000-000000000003'),
  ('70000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000005')
on conflict (need_id, task_id) do nothing;

insert into public.need_decisions (id, household_id, need_id, decision_id)
values
  ('80000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000020', '60000000-0000-4000-8000-000000000001'),
  ('80000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000030', '60000000-0000-4000-8000-000000000003'),
  ('80000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'e0000000-0000-4000-8000-000000000009', '60000000-0000-4000-8000-000000000004')
on conflict (need_id, decision_id) do nothing;

-- ============================================================================
-- Sincronização: conflito ABERTO + item da fila em FALHA (seção 38)
-- ============================================================================
insert into public.sync_runs (
  id, household_id, direction, status, started_at, finished_at,
  created_count, updated_count, skipped_count, failed_count
)
values (
  '90000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
  'import', 'sucesso', '2026-07-10T09:00:00-03:00', '2026-07-10T09:04:30-03:00',
  118, 0, 5, 0
)
on conflict (id) do nothing;

insert into public.sync_conflicts (
  id, household_id, entity_type, entity_id, field, app_value, notion_value,
  app_edited_at, notion_edited_at, status
)
values (
  '91000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
  'need', 'e0000000-0000-4000-8000-000000000015', 'estimated_price',
  '"89.90"', '"99.90"',
  '2026-07-11T10:15:00-03:00', '2026-07-11T18:40:00-03:00', 'aberto'
)
on conflict (id) do nothing;

insert into public.sync_queue (
  id, household_id, entity_type, entity_id, operation, payload,
  idempotency_key, status, attempts, next_attempt_at, last_error
)
values
  ('92000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'need', 'e0000000-0000-4000-8000-000000000010', 'update',
   '{"campo": "estimated_price"}', 'seed-need-10-update-1', 'falha', 3,
   '2026-07-12T12:00:00-03:00', 'Notion API respondeu 502 (Bad Gateway).'),
  ('92000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'need', 'e0000000-0000-4000-8000-000000000002', 'update',
   '{"campo": "acquisition_status"}', 'seed-need-02-update-1', 'pendente', 0,
   '2026-07-12T12:00:00-03:00', null)
on conflict (id) do nothing;

-- Atividade recente -----------------------------------------------------------
insert into public.activity_logs (
  id, household_id, actor_profile_id, entity_type, entity_id, action, changes, origin
)
values
  ('93000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001', 'purchase',
   '20000000-0000-4000-8000-000000000002', 'criacao',
   '{"title": "Bebê conforto ProBaby 360"}', 'app'),
  ('93000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000002', 'need',
   'e0000000-0000-4000-8000-000000000012', 'atualizacao',
   '{"readiness_status": {"de": "pendente", "para": "precisa_lavar"}}', 'app'),
  ('93000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   null, 'need', 'e0000000-0000-4000-8000-000000000015', 'sincronizacao',
   '{"conflito": "estimated_price"}', 'notion'),
  ('93000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001', 'task',
   '50000000-0000-4000-8000-000000000004', 'conclusao',
   '{"completed_at": "2026-07-05"}', 'app')
on conflict (id) do nothing;
