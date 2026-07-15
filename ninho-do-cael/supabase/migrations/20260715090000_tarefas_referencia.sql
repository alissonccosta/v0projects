-- Fase 5 (seção 20): a conclusão de tarefa permite nota, custo real e
-- referência. Nota e custo já existem; a referência (link ou documento
-- consultado) ganha coluna própria para não poluir as notas.

alter table public.tasks
  add column completion_reference text;

comment on column public.tasks.completion_reference is
  'Referência citada na conclusão (link, nota fiscal, documento).';
