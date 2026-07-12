-- Ninho do Cael · Migration 1: enums e domínios (SDD, seções 7.6 e 9)
-- Os valores espelham src/types/domain.ts (fonte única no TypeScript).

-- 4.4 Papéis
create type public.papel_perfil as enum ('owner', 'collaborator');

-- 9.1 Categorias
create type public.categoria as enum (
  'sono', 'amamentacao', 'higiene', 'transporte', 'roupas', 'fraldas',
  'maternidade', 'pos_parto', 'quarto', 'desenvolvimento', 'seguranca',
  'documentos', 'alimentacao'
);

-- 9.2 Fases de uso
create type public.fase_uso as enum (
  'antes_do_parto', 'meses_0_3', 'meses_3_6', 'meses_6_12',
  'apos_12_meses', 'continuo'
);

-- 9.3 Criticidade
create type public.criticidade as enum ('critica', 'alta', 'media', 'baixa');

-- 9.4 Prioridade
create type public.prioridade as enum ('alta', 'media', 'baixa');

-- 9.5 Status de decisão da necessidade
create type public.status_decisao_necessidade as enum (
  'precisa_pesquisar', 'pesquisando', 'comparando', 'escolhido', 'adiado',
  'decisao_profissional_pendente', 'descartado'
);

-- 9.6 Status de aquisição
create type public.status_aquisicao as enum (
  'aguardar', 'aguardando_compra', 'elegivel_para_cha', 'comprado',
  'ja_possui', 'nao_comprar'
);

-- 9.7 Status logístico
create type public.status_logistico as enum (
  'nao_aplicavel', 'nao_confirmado', 'aguardando_envio', 'enviado',
  'entregue', 'devolvido', 'cancelado'
);

-- 9.8 Status de prontidão
create type public.status_prontidao as enum (
  'nao_aplicavel', 'pendente', 'precisa_higienizar', 'precisa_lavar',
  'precisa_esterilizar', 'precisa_arejar', 'precisa_montar',
  'precisa_instalar', 'precisa_configurar', 'precisa_validar',
  'pronto_para_uso'
);

-- 9.9 Status de tarefas
create type public.status_tarefa as enum (
  'planejada', 'em_andamento', 'bloqueada', 'concluida', 'cancelada'
);

-- 9.10 Status de decisões (registro)
create type public.status_registro_decisao as enum (
  'pendente', 'em_analise', 'aguardando_profissional', 'decidida',
  'revisar_depois', 'descartada'
);

-- 7.6 Estados de sincronização
create type public.status_sync as enum (
  'synced', 'pending_push', 'pending_pull', 'conflict', 'error', 'not_linked'
);

-- Domínios complementares (decisões D-020/D-021 em DECISIONS.md)
create type public.tipo_necessidade as enum (
  'produto', 'consumivel', 'servico', 'documento', 'outro'
);

create type public.publico_necessidade as enum ('bebe', 'mae', 'pais', 'casa');

-- Responsável conceitual (seção 4.3: profissionais não são usuários)
create type public.responsavel_tipo as enum (
  'mae', 'pai', 'casal', 'obstetra', 'pediatra', 'maternidade', 'outro'
);

-- Seção 21: tipos de decisão
create type public.tipo_decisao as enum (
  'familiar', 'tecnica', 'medica', 'seguranca', 'financeira'
);

create type public.confianca_decisao as enum ('alta', 'media', 'baixa');

-- Base "Tarefas, Serviços e Documentos"
create type public.tipo_tarefa as enum ('tarefa', 'servico', 'documento');

-- Seções 10.7 e 18: pedidos
create type public.status_compra as enum (
  'confirmada', 'aguardando_envio', 'enviada', 'entregue_parcial',
  'entregue', 'devolvida', 'cancelada'
);

create type public.tipo_compra as enum (
  'online', 'loja_fisica', 'presente', 'servico', 'outro'
);

create type public.forma_pagamento as enum (
  'pix', 'cartao_credito', 'cartao_debito', 'boleto', 'dinheiro', 'outro'
);

-- Estoque (seção 8.1 inventory_items)
create type public.condicao_item as enum ('novo', 'seminovo', 'usado', 'avariado');

create type public.origem_item as enum (
  'compra', 'presente', 'cha_de_bebe', 'emprestimo', 'ja_possuia', 'outro'
);

-- Sincronização (seções 7.8–7.10 e 8.1)
create type public.direcao_sync as enum ('import', 'push', 'pull', 'reconcile');

create type public.status_sync_run as enum (
  'em_execucao', 'sucesso', 'parcial', 'falha'
);

create type public.operacao_sync as enum ('create', 'update', 'archive', 'restore');

create type public.status_fila_sync as enum (
  'pendente', 'processando', 'falha', 'concluida'
);

create type public.status_conflito as enum ('aberto', 'resolvido');

create type public.resolucao_conflito as enum (
  'manter_app', 'manter_notion', 'valor_editado'
);

-- Atividade e auditoria (seção 26)
create type public.origem_atividade as enum ('app', 'notion', 'sistema');

create type public.acao_atividade as enum (
  'criacao', 'atualizacao', 'arquivamento', 'restauracao', 'exclusao',
  'conclusao', 'importacao', 'sincronizacao'
);
