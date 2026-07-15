# Plano de Implementação — Ninho do Cael

Derivado do `SDD_Ninho_Cael.md` (seção 40). Cada fase tem tarefas verificáveis e um
gate obrigatório (seção 0.3): lint, typecheck, testes, build, verificação visual em
desktop e mobile, e atualização do `QA_REPORT.md` — só então a fase seguinte começa.

**Legenda:** `[x]` concluído e testado · `[ ]` pendente

---

## Fase 0 — Preparação ✅ (concluída em 12/07/2026)

Objetivo: projeto, dependências, lint, formatter, env, CI, docs, plano e QA.

- [x] Scaffold Next.js 16 (App Router, TypeScript estrito, Tailwind 4, `src/`, alias `@/*`)
- [x] `tsconfig` endurecido (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- [x] Dependências da stack obrigatória instaladas (seção 6.1) — shadcn/ui fica para a Fase 1
- [x] ESLint (next/core-web-vitals + typescript) + Prettier integrados
- [x] Vitest + Testing Library configurados, com testes reais passando
- [x] Playwright configurado (desktop 1440×900 e mobile 390×844) com smoke de boot,
      checagem de overflow horizontal, axe-core (WCAG 2.2 AA) e screenshots de evidência
- [x] `src/lib/env.ts`: validação Zod das variáveis da seção 7.3, com testes
- [x] `.env.example` completo e comentado
- [x] Página inicial provisória pt-BR sem controles mortos e sem branding de framework
- [x] CI GitHub Actions (`.github/workflows/ninho-do-cael.yml`): lint, formatação,
      tipos, testes, build e E2E em todo push/PR que toque `ninho-do-cael/**`
- [x] Documentação: `README.md`, `docs/notion-field-mapping.md`, `docs/sync-strategy.md`,
      `docs/deployment.md`; README raiz atualizado
- [x] `IMPLEMENTATION_PLAN.md`, `DECISIONS.md`, `QA_REPORT.md` criados

**Gate:** app sobe ✅ · lint ✅ · typecheck ✅ · testes ✅ · build ✅ · visual 390/1440 ✅
(evidências no `QA_REPORT.md`)

---

## Fase 1 — Design system e shell ✅ (concluída em 12/07/2026)

Objetivo: tokens, fontes, componentes base, sidebar, navegação mobile, header, responsividade.

- [x] Tokens completos da paleta (seção 12.2) como design tokens Tailwind v4 (`globals.css`),
      incluindo variantes suaves e "strong" para contraste AA
- [x] Fontes Fraunces (títulos) e Manrope (interface) auto-hospedadas, fallback `system-ui`
- [x] Base de componentes padrão shadcn/ui totalmente tematizada — vendorizada sobre Radix
      (registry bloqueada pela rede; ver D-015): Button, Badge, Card, Dialog, Sheet,
      Skeleton, Separator, Toaster
- [x] Escala de espaçamento (4px), radius (12/18/24/999) e motion (120–220ms, reduced motion)
- [x] Phosphor Icons padronizado (16/20/24, regular; `fill` para navegação ativa; nunca emoji)
- [x] `AppShell`: sidebar desktop 240px, header 64px com breadcrumb, área de sync,
      skip link e landmarks
- [x] Navegação mobile: barra inferior (Início, Necessidades, Tarefas, Compras, Mais) + folha "Mais" (Estoque, Decisões, Jornada, Orçamento, Configurações), toque ≥44px
- [x] Componentes essenciais: MetricCard, StatusBadge (mapeamento centralizado dos 9
      domínios, testado por completude), EmptyState, ConfirmDialog, SyncIndicator
- [x] Estados obrigatórios de layout: loading (skeleton), vazio (EmptyState), erro (retry)
- [x] Rotas da seção 11.1 com navegação real e placeholders honestos (sem controles mortos);
      `/app/design-system` como referência viva dos componentes

**Gate:** capturas 390/768/1440 ✅ · zero overflow (testado por rota) ✅ · navegação
funcional (E2E desktop e mobile) ✅ · toque ≥44px (testado) ✅ · contraste AA (axe) ✅
(evidências no `QA_REPORT.md`)

## Fase 2 — Banco e autenticação 🔶 (implementada em 12/07/2026 — gate parcial)

Objetivo: migrations, RLS, seed, auth, household, profiles, baby.

- [x] Migrations SQL versionadas em `supabase/migrations/` (schema da seção 8:
      households, profiles, babies, needs, products, need_products, purchases,
      purchase_items, inventory_items, tasks, decisions, activity_logs, sync_runs,
      sync_queue, sync_conflicts, household_settings + household_invites e
      relações need_tasks/need_decisions)
- [x] Enums e domínios da seção 9 como tipos Postgres (espelhando `src/types/domain.ts`);
      geração de tipos TS do banco fica para quando houver projeto Supabase (D-025)
- [x] RLS em todas as tabelas privadas com isolamento por `household_id`
- [x] Papéis `owner` e `collaborator` com permissões da seção 4 (delete, convites,
      configurações e sync são do owner; colaboradora cria/edita)
- [x] Auth magic link: `/login`, `/auth/confirm`, logout, guarda de rotas em
      `src/proxy.ts` (Next 16), sessão renovada a cada request
- [x] Onboarding: owner confirma família e Cael (RPC `create_household_with_baby`);
      colaboradora entra por convite (`/convite/[token]` + RPC `accept_household_invite`)
- [x] Configurações > Família: bebê, membros, criação/cópia/revogação de convites
- [x] Seed de desenvolvimento (seção 38) claramente identificado e testado
- [x] Testes de integração num Postgres 17 real (embedded): isolamento entre
      households, papéis, RPCs, convites, constraints e seed (21 testes)
- [x] Modo demonstração honesto sem Supabase (aviso visível; sem login falso)

**Gate:** isolamento comprovado por teste ✅ · regras de papéis ✅ · RPCs ✅ ·
seed ✅ · **login/sessão/convite com Supabase real: pendente de credenciais**
(ação do Alisson — `docs/setup-supabase.md`; testes e2e já preparados ativam
automaticamente com as variáveis presentes)

## Fase 3 — Necessidades 🔶 (implementada em 12/07/2026 — gate parcial)

Objetivo: lista, filtros, detalhe, CRUD, histórico e cálculos.

- [x] API `/api/needs` (GET/POST) e `/api/needs/:id` (GET/PATCH/DELETE) com Zod e `ApiResult`
- [x] Lista com busca sem acento, filtros combináveis (categoria, fase, criticidade,
      responsável, aquisição, logística, prontidão, "antes do parto", "somente pendências",
      "somente críticas") persistidos na URL — testados em unidade e componente
- [x] Visualizações: lista, por categoria, por fase, por prontidão, por responsável
- [x] Criar/editar com obrigatórios e opcionais da seção 16 (server actions com estado
      pendente e erro por campo; refinamento otimista fino na validação com Supabase real)
- [x] Detalhe em página completa (full-screen no mobile — seção 13.2): situação,
      status, valores, observações, ações e histórico. Abas de relações (produtos,
      compras, estoque, tarefas, decisões) entram nas Fases 4–5 com os módulos (D-029)
- [x] Ações rápidas reais: marcar comprada, confirmar entrega, quantidade, pronta,
      arquivar (soft delete) + restaurar — "criar tarefa/decisão daqui" vem na Fase 5
- [x] Cálculos testados: cobertura, prontidão individual, pesos, prontidão geral e
      item vencido (seção 10) em `lib/calculations/`
- [x] `activity_logs` em criação, edição (diff campo a campo), arquivamento e restauração
- [x] 131 registros: carga única no servidor + filtro/agrupamento em memória (D-027);
      sem paginação necessária nesse volume

**Gate:** filtros combinam ✅ (testes) · URL preserva estado ✅ · cálculos testados ✅ ·
mobile sem overflow ✅ · **persistência real de ponta a ponta: e2e autenticado pronto
(`tests/e2e/needs.spec.ts`), ativa e valida quando as credenciais do Supabase existirem**

## Fase 4 — Produtos, compras e estoque 🔶 (implementada em 12/07/2026 — gate parcial)

Objetivo: produtos, compras, itens, entrega, estoque, prontidão e financeiro.

- [x] Produtos: cadastro/edição em dialog, vínculo com necessidade (preferido é único
      por necessidade), link real de loja e **comparador de até 4** em tabela acessível
- [x] Compras: formulário com itens dinâmicos, subtotal calculado dos itens,
      `total = subtotal − desconto + frete` ao vivo, **rateio proporcional em
      centavos** (método de Hamilton, testado) e alerta de divergência > R$ 0,01
      na biblioteca financeira
- [x] Fluxo de entrega com checklist (seção 18): quantidades por item, preparo
      necessário e local → atualiza pedido (parcial/total), **cria estoque,
      atualiza necessidade (quantidade, logística, prontidão inicial), cria
      tarefa de preparo e registra histórico** — planejador puro com 16 testes
- [x] Devolução parcial/total com motivo, validação de valor e impacto no
      comprometido (abate o reembolsado)
- [x] Estoque: agrupamentos por prontidão/local/categoria/validade, item vencido
      destacado, link para a necessidade
- [x] Ações de prontidão + **lote de preparo** (seleção múltipla → aplicar);
      item pronto propaga prontidão à necessidade vinculada
- [x] Cálculos financeiros testados: total/divergência (10.9), comprometido (10.7),
      pendente estimado nos modos total e "até o parto" (10.8), economia (23)
- [x] API da seção 29: /api/products(/:id), /api/purchases(/:id, /deliver, /return),
      /api/inventory(/:id, /batch-readiness)

**Gate:** cálculos e planejadores testados ✅ · UI completa sem overflow ✅ ·
**cadeia compra → entrega → estoque → prontidão roteirizada no e2e autenticado
(`needs.spec.ts`), valida automaticamente com as credenciais do Supabase**

## Fase 5 — Tarefas, decisões e jornada 🔶 (implementada em 15/07/2026 — gate parcial)

- [x] Tarefas: CRUD com status da seção 9.9 e **visões semana / calendário / lista /
      por status / por responsável / bloqueadas / antes do parto** (funções puras
      testadas em `lib/tasks/views.ts`)
- [x] Bloqueadas mostram **dependência, bloqueador, ação derivada e responsável pela
      ação** (D-039); serviço impede auto-dependência e ciclos; dependência concluída
      sinaliza retomada
- [x] **Conclusão com critério confirmado** (checkbox obrigatório) + nota, custo real
      e referência (`completion_reference`, migration 6) — status `concluida` fora do
      formulário de edição (D-034)
- [x] Decisões: tipos (Familiar, Técnica, Médica, Segurança, Financeira), status 9.10,
      separação **"exigem ação / aguardando profissional / decididas / revisar depois /
      descartadas"** com grupos descritos
- [x] Decisões médicas: marcador com estetoscópio, **aviso permanente** (lista, detalhe
      e formulário), sem conclusão automática; **decidir exige conclusão registrada +
      confirmação de orientação profissional** (10.11, reforçado por constraint testada)
- [x] Relações necessidade↔tarefa/decisão: vínculo múltiplo nos formulários, seções no
      detalhe da tarefa/decisão e card **"Relacionados"** no detalhe da necessidade
      (produtos, compras, estoque, tarefas, decisões) com ações "criar tarefa/decisão
      daqui" (fecha o D-029)
- [x] Jornada: seis fases com janela e **marcos derivados da data prevista** (nunca
      fixos no código), resumo de necessidades/tarefas/decisões/compras, prontidão
      ponderada por criticidade e **gasto por fase com devolução rateada** (D-038)
- [x] Toggle "Mostrar itens futuros": fases futuras colapsam em resumo e não poluem a
      urgência atual (D-037)
- [x] API: `GET/POST /api/tasks`, `PATCH /api/tasks/:id`, `POST /api/tasks/:id/complete`,
      `GET/POST /api/decisions`, `PATCH /api/decisions/:id` (seção 29, Zod em tudo)
- [x] 46 testes novos (visões, grupos, jornada, schemas, constraints no Postgres real) + e2e demo com axe e e2e autenticado estendido com o roteiro completo do gate

**Gate:** relações necessidade↔tarefa↔decisão funcionam ✅ (e2e roteirizado + testes)
· filtros por fase corretos ✅ (testes de `phaseForLinked`/agregação + e2e "Ver da
fase") · **validação com Supabase real aguarda credenciais** (mesma pendência das
Fases 2–4)

## Fase 6 — Dashboard e orçamento

- [ ] `/api/dashboard` com agregados calculados no servidor (nunca hardcoded — seção 1.4)
- [ ] Prontidão geral ponderada por criticidade (seção 10.5) + antes do parto + críticos
- [ ] Contagem regressiva para 15/11/2026 sem virar previsão médica
- [ ] Financeiro: pago, pendente estimado, economia, pedidos aguardando entrega
- [ ] Próximas ações ordenadas (vencido → crítico → prazo → bloqueador → prioridade)
- [ ] Alertas acionáveis (seção 15.5) e atividade recente
- [ ] Gráficos Recharts com resumo textual (a11y): prontidão e gastos por categoria,
      compras por status, cronograma por fase
- [ ] Orçamento: indicadores e regras da seção 23, sem duplicar kits
- [ ] Pesquisa global (atalho `/`, ignora acento, prioriza título)

**Gate:** tudo vem do banco · zero números hardcoded · performance (seção 32)

## Fase 7 — Integração Notion

- [ ] Camada server-side isolada em `server/sync/` + `lib/notion/`
- [ ] Configurações > Integração: validação de credencial e das seis fontes, prévia
- [ ] Importação inicial paginada, normalizada, em duas passagens, idempotente,
      com `sync_run` e progresso na interface
- [ ] Push app → Notion via `sync_queue` (retentativa exponencial, idempotência)
- [ ] Webhook `POST /api/webhooks/notion` (assinatura, resposta rápida, dedupe, fila)
- [ ] Reconciliação periódica (hash, conflitos, métricas, "Sincronizar agora")
- [ ] Tela de conflitos campo a campo (manter app / manter Notion / editar) —
      nunca resolução automática para os campos da seção 7.7
- [ ] Painel de sync (última execução, fila, falhas, conflitos)
- [ ] Testes com mocks explícitos do SDK; documentação do que exige credencial real

**Gate:** importação idempotente · app→Notion · Notion→app · conflito controlado ·
falha de sync sempre visível

## Fase 8 — PWA, offline e polish

- [ ] Manifest, ícones, tema, instalação standalone
- [ ] Offline: visualizar último estado, indicador claro; escrita offline só se robusta,
      senão leitura + explicação (seção 28)
- [ ] Estados de erro da seção 36 em todas as telas (salvar falhou, sync falhou,
      Notion indisponível, Supabase indisponível, sem dados)
- [ ] Notificações no app (seção 25) com central
- [ ] Motion 120–220ms com reduced motion
- [ ] Revisão completa de acessibilidade (WCAG 2.2 AA, seção 31)

**Gate:** PWA instala · offline seguro · axe sem violações graves em todas as telas

## Fase 9 — QA final e deploy

- [ ] E2E obrigatórios da seção 35 (15 cenários) verdes
- [ ] QA visual completo (checklist da seção 42) em 390/430/768/1024/1440
- [ ] Performance: conteúdo útil < 2,5s em móvel razoável, interação < 200ms
- [ ] Revisão de segurança (seção 33): segredos, RLS, rate limiting, CSP, CSRF, sanitização
- [ ] Deploy Vercel + Supabase (docs/deployment.md), cron e webhook registrados
- [ ] README final permite instalação por outra pessoa
- [ ] `QA_REPORT.md` final + capturas de todas as telas principais + URL de preview

**Gate:** critérios de aceite globais da seção 41, todos atendidos

---

## Critérios transversais (valem para toda fase)

- Todo controle visível: funcional e testado, desabilitado com motivo, ou ausente (seção 0.2)
- Sem números hardcoded desconectados do banco; sem dados falsos silenciosos
- Sem segredo no cliente; RLS sempre ativa
- Mobile-first: sem overflow em 390px, toque ≥44px, salvar visível com teclado aberto
- Definition of Done por feature: seção 44 (16 itens)
