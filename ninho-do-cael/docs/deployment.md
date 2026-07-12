# Deploy — Ninho do Cael

> **Documento vivo.** O deploy acontece na Fase 9. Este documento registra o
> plano e será atualizado com os passos executados e a URL final.
> **Estado atual: nenhum ambiente publicado.**

## Arquitetura de produção prevista (SDD, seção 6.1)

- **Vercel** — aplicação Next.js (App Router).
- **Supabase** — Postgres, Auth e Row Level Security.
- **Notion** — integração server-side via SDK oficial + webhooks.

## Pré-requisitos

1. Projeto no Supabase com migrations aplicadas (`supabase/migrations/`).
2. Integração interna criada no Notion com acesso às seis fontes de dados.
3. Projeto na Vercel apontando para `ninho-do-cael/` como root directory.

## Variáveis de ambiente na Vercel

Todas as variáveis de `.env.example`. Atenção:

- `SUPABASE_SERVICE_ROLE_KEY` e `NOTION_ACCESS_TOKEN`: escopo **server-side
  somente** — nunca prefixar com `NEXT_PUBLIC_`.
- `CRON_SECRET`: usado pelo agendamento da reconciliação periódica.
- `APP_URL`: URL pública final.

## Tarefas da Fase 9 (a executar)

- [ ] Criar projeto Supabase e aplicar migrations
- [ ] Configurar Auth (magic link) e domínios permitidos
- [ ] Criar projeto Vercel (root: `ninho-do-cael/`)
- [ ] Preencher variáveis de ambiente
- [ ] Configurar cron de reconciliação (Vercel Cron → `POST /api/sync/run`)
- [ ] Registrar webhook do Notion → `POST /api/webhooks/notion`
- [ ] Smoke test em produção (login, dashboard, CRUD, sync)
- [ ] Registrar URL de preview/produção aqui e no `QA_REPORT.md`
