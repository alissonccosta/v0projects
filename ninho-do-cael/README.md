# Ninho do Cael

Sistema de gestão inteligente do enxoval e da preparação para a chegada do Cael.

Aplicativo web responsivo e instalável (PWA) para Alisson e Duda acompanharem necessidades, compras, entregas, estoque, prontidão, tarefas, decisões e orçamento — com o Supabase como fonte operacional e o Notion como fonte integrada e espelho sincronizado.

A especificação completa do produto está no `SDD_Ninho_Cael.md` (documento de origem do projeto). O andamento é acompanhado em:

- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — fases e tarefas verificáveis;
- [`DECISIONS.md`](./DECISIONS.md) — decisões técnicas tomadas durante a implementação;
- [`QA_REPORT.md`](./QA_REPORT.md) — evidências de qualidade por fase.

## Stack

- **Next.js 16** (App Router, React Server Components, TypeScript estrito)
- **Tailwind CSS 4** + shadcn/ui tematizado (a partir da Fase 1)
- **Supabase** (Postgres, Auth, RLS, migrations versionadas) — a partir da Fase 2
- **Notion SDK** no servidor (importação, push, webhooks, reconciliação) — Fase 7
- **Vitest + Testing Library** (unitários), **Playwright** (E2E), **axe-core** (acessibilidade)
- **GitHub Actions** (CI) e **Vercel** (deploy previsto)

## Requisitos

- Node.js 20 ou superior (desenvolvido com Node 22)
- npm 10 ou superior

## Como rodar

```bash
cd ninho-do-cael
npm install
cp .env.example .env.local   # preencha quando for usar Supabase/Notion
npm run dev                  # http://localhost:3000
```

Sem as variáveis do Supabase o app roda em **modo demonstração**: nada é bloqueado, um aviso "Sem autenticação" fica visível e as telas de login/família explicam a configuração pendente — nunca fingimos login. Para ativar autenticação, família e convites, siga o guia [`docs/setup-supabase.md`](./docs/setup-supabase.md).

## Scripts

| Script                 | O que faz                                          |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | servidor de desenvolvimento                        |
| `npm run build`        | build de produção                                  |
| `npm run start`        | serve o build de produção                          |
| `npm run lint`         | ESLint                                             |
| `npm run typecheck`    | TypeScript sem emitir arquivos                     |
| `npm run test`         | testes unitários e de integração (Vitest)          |
| `npm run test:watch`   | testes em modo watch                               |
| `npm run e2e`          | testes E2E (Playwright; faz build + start sozinho) |
| `npm run format`       | formata com Prettier                               |
| `npm run format:check` | verifica formatação                                |

### Testes de banco (RLS) num Postgres real

Os testes de integração sobem um **Postgres 17 real** (binários via npm,
`embedded-postgres`), aplicam as migrations e provam o isolamento por família
e as permissões por papel. Não precisa instalar nada. Única ressalva: o
Postgres não roda como root — em containers root, execute
`su <usuario-comum> -c "npm run test"` (no CI do GitHub já é o padrão).

### E2E em ambientes sem download de browser

O Playwright baixa o Chromium automaticamente (`npx playwright install chromium`). Em ambientes onde o download não é possível, aponte `PW_CHROMIUM_PATH` para um executável Chromium existente:

```bash
PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run e2e
```

## Variáveis de ambiente

Documentadas em [`.env.example`](./.env.example) (SDD, seção 7.3). Regras inegociáveis:

- `SUPABASE_SERVICE_ROLE_KEY` e `NOTION_ACCESS_TOKEN` são **somente de servidor** e nunca podem chegar ao cliente;
- `src/lib/env.ts` valida formato e presença com Zod e falha com mensagem clara.

## Estrutura

```text
ninho-do-cael/
  src/
    app/            rotas (App Router; módulos sob /app/*)
    components/
      app-shell/    sidebar, header, navegação inferior
      status/       StatusBadge + mapeamento centralizado de status
      sync/         SyncIndicator
      ui/           base de componentes tematizada (padrão shadcn/ui sobre Radix)
    lib/            utilitários (env, navegação, cn; cálculos chegam na Fase 3)
    types/          domínios e enums do produto (seção 9 do SDD)
  tests/
    e2e/            testes Playwright
  docs/
    notion-field-mapping.md   mapeamento Notion ↔ app
    sync-strategy.md          estratégia de sincronização
    deployment.md             deploy (Vercel + Supabase)
    qa/                       evidências visuais por fase
  supabase/         migrations e seed (a partir da Fase 2)
```

A rota interna `/app/design-system` é a referência viva dos tokens e componentes.

Os demais diretórios da árvore prevista no SDD (seção 30) são criados quando a fase correspondente lhes dá conteúdo real.

## Integração contínua

O workflow [`.github/workflows/ninho-do-cael.yml`](../.github/workflows/ninho-do-cael.yml) roda lint, formatação, tipos, testes unitários, build e E2E a cada push/PR que toque `ninho-do-cael/**`.
