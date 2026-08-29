# Decisões Técnicas — Ninho do Cael

Registro das decisões não totalmente determinadas pelo `SDD_Ninho_Cael.md`
(exigência da seção 0). Cada entrada traz contexto, decisão e consequência.
Decisões novas entram no topo da fase correspondente.

---

## Fase 6 — 15/07/2026

### D-040 · "Antes do parto" no painel usa o conjunto da 10.8

O card de prontidão "antes do parto" (15.3) considera as fases
`antes_do_parto` e `continuo` — o mesmo conjunto que a 10.8 usa para o
pendente estimado "até o parto". Itens contínuos precisam estar prontos na
chegada do Cael; deixá-los fora inflaria o número.

### D-041 · Pago × comprometido no orçamento

A seção 23 lista "pago" e "comprometido" como indicadores distintos, sem
defini-los. Régua adotada: **comprometido** é o total líquido da 10.7 (tudo
que saiu ou vai sair do bolso); **pago (entregue)** é a parte cujas compras
já foram entregues/encerradas; **a caminho** é a diferença (pedidos
confirmados/enviados). Economia = descontos (10.7/23); frete e devolvido
aparecem separados. Tudo em `lib/budget/model.ts`, testado.

### D-042 · Busca global em memória, no servidor

`/api/search` carrega títulos das cinco entidades em cinco consultas
paralelas e usa as mesmas funções puras de normalização sem acento da lista
de necessidades (mesmo racional de volume da D-027). Ranking: título começa
com o termo → título contém → campo secundário contém (marca, fornecedor,
pergunta). O atalho `/` abre o diálogo em qualquer tela; em modo
demonstração o controle não aparece (seção 0.2).

### D-043 · Gráficos com tokens CSS e resumo textual visível

Recharts recebe as cores como `var(--…)` direto dos design tokens (nada de
hex duplicado) e todo gráfico vem acompanhado de um resumo textual visível
(seções 15.6 e 31) — o gráfico ilustra, o texto garante a informação.
Animações desligadas (`isAnimationActive={false}`): respeita reduced motion
e evita reflow na primeira pintura.

### D-044 · Fim dos placeholders

Com painel, orçamento e atividade reais, nenhum módulo usa mais
`ModulePlaceholder`; o componente e seu teste foram removidos (código morto
viola o espírito da seção 0.1). O feed de atividade resolve títulos das
entidades em lotes (`.in(id, …)`) — sem N+1 (seção 32).

---

## Fase 5 — 15/07/2026

### D-034 · Concluir e decidir têm fluxos próprios, fora dos formulários

Os formulários de tarefa e decisão não oferecem os status terminais
(`concluida`/`decidida`): os schemas os excluem e os serviços validam também o
estado resultante de PATCH parcial da API. Concluir tarefa exige a confirmação
do critério (seção 20) num diálogo que mostra o critério registrado; decidir
exige conclusão escrita (seção 21) e, em decisão médica, ainda a confirmação de
que a orientação veio de profissional (10.11) — reforçando a constraint
`decisao_medica_exige_conclusao` já existente no banco. Nada no sistema muda
esses status como efeito colateral.

### D-035 · Fase de tarefas e decisões derivada dos vínculos

Tarefas e decisões não têm coluna de fase. Na Jornada (seção 22), a fase vem da
necessidade vinculada mais cedo; sem vínculo, do prazo em relação à data
prevista do parto (`phaseForDate`); sem ambos, `continuo`. Funções puras e
testadas em `lib/journey/model.ts`.

### D-036 · Referência da conclusão em coluna própria

A seção 20 permite "nota, custo real e referência" na conclusão. Nota e custo
já existiam; a referência (link, nota fiscal) ganhou a coluna
`tasks.completion_reference` (migration `20260715090000`) em vez de poluir a
nota — o mapeamento para o Notion na Fase 7 fica direto.

### D-037 · "Mostrar itens futuros" via URL nesta fase

O toggle da Jornada usa `?futuros=1`: estado compartilhável, sem escrita no
banco e sem exigir permissão de owner (a coluna de `household_settings` é
gravável só pelo owner na RLS). A persistência da preferência entra com a tela
de configurações correspondente (Fases 6/8).

### D-038 · Gasto por fase com devolução rateada

O gasto de cada fase soma os `total` dos itens de compra cujas necessidades
pertencem à fase; devoluções (registradas no pedido, D-033) são abatidas
proporcionalmente ao rateio dos itens (método de Hamilton, o mesmo de D-031),
então a soma das fases bate com o comprometido da seção 10.7. Itens sem
necessidade vinculada não somem: aparecem como aviso "sem fase" no rodapé.

### D-039 · Dependências de tarefa resolvidas em memória

A lista carrega todas as tarefas da família (volume pequeno, mesmo racional de
D-027) e resolve `depends_on_task_id` num `Map`, evitando o self-join ambíguo
do PostgREST. O serviço bloqueia auto-dependência e ciclos (caminha a cadeia
antes de gravar) e o card de bloqueada (seção 20) deriva a ação: "Concluir
«dependência»" com o responsável dela; sem dependência, "Resolver: «motivo»"
com o responsável da própria tarefa.

---

## Fase 4 — 12/07/2026

### D-030 · Regras de compra/entrega como planejadores puros

`lib/purchases/plan.ts` decide tudo (status parcial/total, estoque a criar,
necessidades a atualizar, tarefas de preparo, validações de devolução) sem
tocar no banco; os serviços apenas executam o plano. Isso deixa a regra da
seção 18 coberta por testes rápidos e independentes do Supabase.

### D-031 · Subtotal calculado a partir dos itens

No formulário de compra o subtotal é sempre a soma dos itens (não um campo
livre), eliminando divergência na criação; o alerta de divergência da seção
10.9 (`hasTotalDivergence`) fica para reconciliar dados importados do Notion
na Fase 7. Rateio de desconto/frete é proporcional ao subtotal de cada item,
em centavos, sem perder nem inventar centavo (método de Hamilton, testado).

### D-032 · Semântica das propagações automáticas

Compra criada com item vinculado marca a necessidade como `comprado` (e
`aguardando_envio` se a logística não estava confirmada). Entrega soma a
quantidade recebida, define logística (`entregue`/`enviado` se parcial) e, se a
necessidade estava `pendente`, assume o preparo informado. Item de estoque
marcado `pronto_para_uso` propaga a prontidão à necessidade vinculada. Tudo
gera `activity_logs`.

### D-033 · Devolução no próprio pedido

Sem tabela própria no MVP: `returned_amount` acumula devoluções parciais (com
motivo concatenado) e a total muda o status para `devolvida`. O comprometido
(10.7) abate o valor devolvido. Constraint no banco impede devolver mais que o
total.

---

## Fase 3 — 12/07/2026

### D-027 · Filtragem de necessidades em memória, no servidor

A base tem ~131 necessidades (seção 1.4): a página carrega tudo em uma consulta
e filtra/ordena/agrupa com funções puras testadas (`lib/needs/filters.ts`),
compartilhadas pela API. Interação local fica muito abaixo dos 200ms da seção 32
e a URL é atualizada de forma rasa (`history.replaceState`), preservando o
estado sem novo fetch. Se o volume crescer uma ordem de grandeza, o mesmo
contrato de filtros passa a ser aplicado no SQL (paginação) sem mudar a UI.

### D-028 · E2E autenticado via link administrativo

O login é por magic link (sem senha), o que normalmente impede e2e automatizado.
Solução: o spec `tests/e2e/needs.spec.ts` usa a admin API do Supabase
(service_role, só no runner) para criar um usuário de teste e gerar o
`action_link` do magic link — o Playwright entra por ele, faz onboarding e
percorre criar → buscar → ação rápida → arquivar → restaurar, limpando tudo no
final. Os testes ativam sozinhos quando as três variáveis existirem no ambiente.

### D-029 · Relações do detalhe chegam com os módulos

O detalhe da necessidade nasce com situação, valores, ações rápidas e
histórico. As abas de relações (Produtos, Compras, Estoque, Tarefas, Decisões
— seção 14) entram nas Fases 4 e 5, quando essas entidades ganham telas; antes
disso seriam links mortos, proibidos pela seção 0.2.

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
