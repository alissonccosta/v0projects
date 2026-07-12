-- Ninho do Cael · Migration 5: devolução de compras (SDD, seção 18)
-- Devolução parcial acumula em returned_amount; total muda o status para
-- 'devolvida'. O impacto financeiro é calculado em lib/calculations.

alter table public.purchases
  add column returned_amount numeric(12, 2) not null default 0
    check (returned_amount >= 0),
  add column return_reason text;

alter table public.purchases
  add constraint purchases_devolucao_dentro_do_total
    check (returned_amount <= total);
