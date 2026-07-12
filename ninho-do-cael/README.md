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

Na Fase 0 o app sobe sem nenhuma variável preenchida. As integrações (Supabase, Notion) passam a exigir suas variáveis quando as fases correspondentes forem implementadas — e falham com mensagem clara caso faltem, em vez de operar com dados falsos.

## Scripts

| Script                 | O que faz                                          |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | servidor de desenvolvimento                        |
| `npm run build`        | build de produção                                  |
| `npm run start`        | serve o build de produção                          |
| `npm run lint`         | ESLint                                             |
| `npm run typecheck`    | TypeScript sem emitir arquivos                     |
| `npm run test`         | testes unitários (Vitest)                          |
| `npm run test:watch`   | testes unitários em modo watch                     |
| `npm run e2e`          | testes E2E (Playwright; faz build + start sozinho) |
| `npm run format`       | formata com Prettier                               |
| `npm run format:check` | verifica formatação                                |

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
    app/            rotas (App Router)
    lib/            utilitários (env, validação, cálculos, formatadores)
  tests/
    e2e/            testes Playwright
  docs/
    notion-field-mapping.md   mapeamento Notion ↔ app
    sync-strategy.md          estratégia de sincronização
    deployment.md             deploy (Vercel + Supabase)
    qa/                       evidências visuais por fase
  supabase/         migrations e seed (a partir da Fase 2)
```

Os demais diretórios da árvore prevista no SDD (seção 30) são criados quando a fase correspondente lhes dá conteúdo real.

## Integração contínua

O workflow [`.github/workflows/ninho-do-cael.yml`](../.github/workflows/ninho-do-cael.yml) roda lint, formatação, tipos, testes unitários, build e E2E a cada push/PR que toque `ninho-do-cael/**`.
