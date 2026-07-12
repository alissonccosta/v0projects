# Decisões Técnicas — Ninho do Cael

Registro das decisões não totalmente determinadas pelo `SDD_Ninho_Cael.md`
(exigência da seção 0). Cada entrada traz contexto, decisão e consequência.
Decisões novas entram no topo da fase correspondente.

---

## Fase 2 — 12/07/2026

### D-020 · Domínios complementares não fixados pelo SDD

O SDD define os enums da seção 9, mas deixa abertos alguns domínios usados
pelo schema. Definidos assim (mapeamento fino com o Notion acontece na Fase 7):

- `responsavel_tipo`: `mae`, `pai`, `casal`, `obstetra`, `pediatra`,
  `maternidade`, `outro` — papéis conceituais (seção 4.3), não usuários;
- `tipo_necessidade`: `produto`, `consumivel`, `servico`, `documento`, `outro`;
- `publico_necessidade`: `bebe`, `mae`, `pais`, `casa`;
- `status_compra` inclui `entregue_parcial` (entrega parcial é requisito da
  seção 38); `tipo_compra`, `forma_pagamento`, `condicao_item`, `origem_item`
  conforme a migration de enums.

### D-021 · RLS testada contra Postgres real (embedded-postgres via npm)

A política de rede permite apenas registries de pacotes, e o Docker não tem
daemon no ambiente — então os testes de integração sobem um Postgres 17 real
com binários distribuídos pelo npm (`embedded-postgres`), aplicam um shim
mínimo do Supabase (roles `anon/authenticated/service_role`, `auth.users`,
`auth.uid()` lendo as claims) e rodam as migrations de verdade. Ressalva: o
Postgres não roda como root — em containers root, executar os testes com um
usuário comum (`su pgtest -c "npm run test"`); no CI do GitHub já é o padrão.

### D-022 · Guarda de rotas no `src/proxy.ts` (Next 16)

O Next 16 renomeou `middleware.ts` para `proxy.ts` (confirmado na documentação
embarcada em `node_modules/next/dist/docs`). A decisão de acesso é uma função
pura (`lib/auth/route-guard.ts`) testada em unidade; o proxy valida a sessão
com `supabase.auth.getUser()` a cada request protegida e renova os cookies.

### D-023 · Modo demonstração honesto sem Supabase

Sem `NEXT_PUBLIC_SUPABASE_*`, nada é bloqueado e nenhum formulário de login é
renderizado — telas explicam a configuração pendente e um banner "Sem
autenticação" fica visível no app (seções 0.1/0.2/46). Com as variáveis
presentes, a guarda passa a exigir sessão e os e2e de auth reais ativam
automaticamente.

### D-024 · Entrada por RPCs `security definer`

Usuário recém-autenticado ainda não tem perfil, então nenhuma policy o
alcança. As únicas portas de criação são `create_household_with_baby` e
`accept_household_invite` (validação completa, `search_path` fixo, execute
apenas para `authenticated`). Convites: token uuid de uso único, validade de
14 dias, revogável pelo owner.

### D-025 · Tipos TS do banco adiados para quando houver projeto real

`supabase gen types` exige instância acessível. Até lá, as poucas consultas
existentes tipam o retorno no ponto de uso; a geração entra junto com a
validação final da fase (comando documentado no README).

### D-026 · Seed exclusivamente local

`supabase/seed.sql` insere usuários fictícios em `auth.users` e por isso só
roda em banco local (`supabase db reset`). Produção começa vazia pelo
onboarding. O seed é idempotente e verificado por teste de integração.

---

## Fase 1 — 12/07/2026

### D-015 · Componentes base vendorizados manualmente (padrão shadcn/ui sobre Radix)

A política de rede do ambiente permite apenas registries de pacotes (npm etc.) e
bloqueia `ui.shadcn.com`, então `shadcn init/add` não funciona aqui. Como o modelo
do shadcn/ui é justamente "copie e possua os componentes", eles foram escritos à mão
em `src/components/ui/` sobre os primitives do Radix (instalados via npm), com a
mesma API e estrutura — e já nasceram tematizados com a paleta do SDD, o que
elimina qualquer estágio com o visual default (proibido pela seção 0.1).
Componentes futuros seguem o mesmo padrão.

### D-016 · Breakpoint do shell em 1024px (lg)

A sidebar aparece de 1024px em diante; 768px (tablet retrato) usa o padrão mobile
(header + barra inferior), que funciona bem ao toque. A seção 13.3 descreve a
sidebar para desktop; 768 não comporta sidebar fixa + conteúdo confortável.

### D-017 · Variantes "strong" de cor para texto pequeno

Os tons de status do SDD (warning `#B3833E`, info `#667D7A` etc.) não atingem
4,5:1 sobre os fundos suaves dos badges. Textos pequenos usam variantes
escurecidas via `color-mix` com forest-900 (`--warning-strong` etc.), mantendo a
paleta como base e cumprindo WCAG AA (seção 31). Verificado por axe no E2E.

### D-018 · Página interna `/app/design-system`

Referência viva de tokens e componentes, fora da navegação principal. Valores de
exemplo são explicitamente rotulados como exemplo (não violam a regra de dados
falsos silenciosos) e a página serve de alvo estável para QA visual e axe.

### D-019 · URLs da seção 11.1 são canônicas; raiz redireciona

As rotas vivem literalmente sob `/app/*` (pasta `src/app/app/`), como a seção 11.1
define — a árvore da seção 30 usa `(app)` como agrupador, que não gera segmento.
`/` redireciona para `/app/dashboard`. `/login` só nasce na Fase 2, junto com a
autenticação real (uma tela de login sem backend seria um controle falso).
Perfil e sair também entram na Fase 2 (seção 11.2, rodapé da sidebar).

---

## Fase 0 — 12/07/2026

### D-001 · Projeto em subdiretório `ninho-do-cael/`

O repositório `v0projects` é multi-projeto (já contém `verumoverview/`, um produto
distinto e sem código aproveitável para este SDD). O Ninho do Cael vive em
`ninho-do-cael/`, com os arquivos de acompanhamento na raiz do projeto, conforme a
árvore da seção 30. O CI fica na raiz do repositório com filtro de path.

### D-002 · npm como gerenciador de pacotes

Convenção do repositório (`AGENTS.md` menciona `npm test`; o outro projeto usa npm).
`package-lock.json` commitado; CI usa `npm ci`.

### D-003 · Versões da stack (instaladas e travadas pelo lockfile)

| Pacote                | Versão  |
| --------------------- | ------- |
| next                  | 16.2.10 |
| react / react-dom     | 19.2.4  |
| typescript            | 5.9.3   |
| tailwindcss           | 4.3.2   |
| zod                   | 4.4.3   |
| @supabase/supabase-js | 2.110.2 |
| @supabase/ssr         | 0.12.0  |
| @notionhq/client      | 5.23.0  |
| react-hook-form       | 7.81.0  |
| recharts              | 3.9.2   |
| sonner                | 2.x     |
| date-fns              | 4.4.0   |
| @phosphor-icons/react | 2.1.10  |
| vitest                | 4.1.10  |
| @playwright/test      | 1.61.1  |
| prettier              | 3.9.5   |
| eslint                | 9.39.5  |

Node mínimo: 20 (`engines`); desenvolvimento em Node 22. Zod 4 usa a API
top-level (`z.url()`, `z.uuid()`).

### D-004 · shadcn/ui inicializa na Fase 1, não na Fase 0

O SDD proíbe o visual default do shadcn/ui (seção 0.1). Inicializar o kit sem a
tematização completa criaria exatamente o estado proibido. O init acontece na
Fase 1 junto com tokens, fontes e tematização, em um único passo verificável.

### D-005 · Fontes definitivas (Fraunces/Manrope) na Fase 1, auto-hospedadas

A Fase 0 usa `system-ui` para não depender de rede no build (o template default com
Geist via Google Fonts foi removido). Na Fase 1 as fontes do SDD (seção 12.4) entram
auto-hospedadas (ex.: `@fontsource`/`next/font` local), evitando falha de build em
ambiente sem acesso ao Google Fonts e melhorando privacidade.

### D-006 · Testes: unitários co-localizados, integração e E2E em `tests/`

Unitários vivem ao lado do código (`src/**/*.test.ts[x]`), integração em
`tests/integration/` e E2E em `tests/e2e/` (árvore da seção 30). Vitest roda em
jsdom com Testing Library; resolução de paths do tsconfig é nativa do Vite
(`resolve.tsconfigPaths`), sem plugin extra.

### D-007 · E2E somente em Chromium no MVP

Os viewports obrigatórios (seção 13.1) rodam em Chromium: desktop 1440×900 e mobile
390×844 (descriptor Pixel 7 com viewport sobrescrito — o descriptor iPhone exigiria
WebKit, que não está disponível no ambiente de execução nem agrega no MVP).
Cobertura WebKit/Firefox pode entrar depois sem mudança de arquitetura.
`chromiumSandbox: false` porque containers de CI/execução rodam como root.
Em ambientes sem download de browser, `PW_CHROMIUM_PATH` aponta um Chromium local.

### D-008 · E2E sobe o build de produção

`playwright.config.ts` usa `webServer: npm run build && npm run start` — o smoke
testa o artefato real, não o dev server. Localmente, um servidor já em execução é
reaproveitado (`reuseExistingServer`).

### D-009 · Diretórios da seção 30 criados sob demanda

Criar a árvore inteira vazia (com `.gitkeep`) sugeriria estrutura pronta sem
conteúdo real — contra o espírito da seção 0.1. Cada diretório nasce na fase que
lhe dá conteúdo (ex.: `supabase/migrations/` na Fase 2, `src/server/sync/` na
Fase 7). O `IMPLEMENTATION_PLAN.md` mapeia onde cada parte entra.

### D-010 · SDD versionado dentro do projeto

`SDD_Ninho_Cael.md` foi copiado para `ninho-do-cael/` e é a referência canônica das
próximas fases (o ambiente de execução é efêmero; a especificação precisa viver no
repositório). `IMPLEMENTATION_PLAN.md`, `DECISIONS.md` e `QA_REPORT.md` referenciam
as seções dele.

### D-011 · Validação de ambiente com falha explícita (`src/lib/env.ts`)

Todas as variáveis da seção 7.3 são opcionais no parse geral da Fase 0 (o app sobe
sem credenciais), mas com formato validado quando presentes (URL, UUID, data). Cada
funcionalidade futura usa `requireServerEnv([...])`, que falha com mensagem clara em
português em vez de operar com valores ausentes — implementa "não fingir integração"
(seções 0.1 e 46). `getServerEnv()` recusa execução no cliente.

### D-012 · Ícone provisório on-palette

O favicon default do Next foi substituído por um `icon.svg` mínimo na paleta do SDD
(ninho abstrato em creme/oliva/madeira). A identidade visual definitiva (ícones PWA,
`public/brand/`) é tarefa da Fase 1/8.

### D-013 · Deploy adiado para a Fase 9 (sem credenciais no ambiente)

Não há credenciais de Vercel/Supabase/Notion neste ambiente. Toda a camada será
implementada com `.env.example`, mocks explícitos em teste e documentação
(`docs/deployment.md`), sem fingir integração ativa — exatamente como a seção 46
determina. Nenhuma fase 0–8 bloqueia por isso.

### D-014 · `AGENTS.md` do Next mantido no projeto

O `create-next-app` gerou `AGENTS.md`/`CLAUDE.md` apontando para a documentação do
Next 16 em `node_modules/next/dist/docs/`. Mantidos: complementam (não conflitam com)
o `AGENTS.md` da raiz do repositório e reduzem risco de código desatualizado nas
próximas fases.
