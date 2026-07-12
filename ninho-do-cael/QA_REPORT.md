# Relatório de QA — Ninho do Cael

Evidências de qualidade por fase (SDD, seção 0.3). Atualizado ao final de cada
fase, antes de iniciar a seguinte. Problemas conhecidos ficam registrados com
severidade (P0 bloqueia release; P1 bloqueia fase; P2 corrigir em breve;
P3 cosmético/planejado).

---

## Fase 0 — Preparação · **APROVADA** · 12/07/2026

### Comandos do gate

| Verificação | Comando                | Resultado                                                        |
| ----------- | ---------------------- | ---------------------------------------------------------------- |
| Lint        | `npm run lint`         | ✅ sem erros e sem warnings                                      |
| Formatação  | `npm run format:check` | ✅ todos os arquivos no padrão                                   |
| Tipos       | `npm run typecheck`    | ✅ sem erros (strict + `noUncheckedIndexedAccess`)               |
| Unitários   | `npm run test`         | ✅ 2 arquivos, 11 testes aprovados                               |
| Build       | `npm run build`        | ✅ Next 16.2.10; rotas estáticas `/`, `/_not-found`, `/icon.svg` |
| Boot + E2E  | `npm run e2e`          | ✅ 2/2 (build de produção servido e testado)                     |

### Testes existentes

- `src/lib/env.test.ts` (9): validação Zod das variáveis da seção 7.3 — ambiente
  vazio aceito na Fase 0, formatos inválidos rejeitados com mensagem clara,
  `requireServerEnv` lista faltantes em português, `getServerEnv` bloqueado no
  navegador.
- `src/app/page.test.tsx` (2): página inicial apresenta produto e fase; **zero
  controles interativos sem função** (seção 0.2).
- `tests/e2e/boot.spec.ts` (2 projetos): resposta 200, título e h1 corretos,
  **sem overflow horizontal** (`scrollWidth ≤ clientWidth`), **axe-core WCAG
  2.2 AA sem violações graves**, screenshots capturados.

### Verificação visual

| Viewport         | Evidência                              | Conferido                                                 |
| ---------------- | -------------------------------------- | --------------------------------------------------------- |
| Mobile 390×844   | `docs/qa/fase-0/home-mobile-390.png`   | sem overflow, texto íntegro, card legível, paleta correta |
| Desktop 1440×900 | `docs/qa/fase-0/home-desktop-1440.png` | centralização, contraste, hierarquia tipográfica          |

Paleta aplicada conforme seção 12.2 (canvas `#F5F0E6`, surface `#FFFDF8`, sand
`#D8CBB8`, forest-900 `#29352C`, text-secondary `#687067`), radius de card 18px.
Sem branding de framework, sem emoji como ícone, sem botões falsos.

### Ambiente de verificação

Node 22.22.2 · npm 10.9.7 · Chromium via `PW_CHROMIUM_PATH` (ambiente sem
download de browsers; em CI o Chromium é instalado pelo Playwright).

### Problemas conhecidos

| Sev. | Problema                                                             | Plano                                            |
| ---- | -------------------------------------------------------------------- | ------------------------------------------------ |
| P3   | Identidade visual provisória: fontes `system-ui` e ícone placeholder | Fase 1 (Fraunces/Manrope auto-hospedadas, marca) |
| P3   | Workflow de CI criado mas ainda sem primeira execução no GitHub      | conferir no primeiro push/PR desta branch        |
| P3   | axe-core cobre apenas a página inicial (única rota existente)        | ampliar a cada fase junto com as novas telas     |

Pendências P0/P1/P2: **nenhuma**.

---

## Fase 1 — Design system e shell · **APROVADA** · 12/07/2026

### Comandos do gate

| Verificação | Comando                | Resultado                                                             |
| ----------- | ---------------------- | --------------------------------------------------------------------- |
| Lint        | `npm run lint`         | ✅ sem erros e sem warnings                                           |
| Formatação  | `npm run format:check` | ✅ todos os arquivos no padrão                                        |
| Tipos       | `npm run typecheck`    | ✅ sem erros                                                          |
| Unitários   | `npm run test`         | ✅ 6 arquivos, 22 testes aprovados                                    |
| Build       | `npm run build`        | ✅ 12 rotas do app estáticas                                          |
| E2E         | `npm run e2e`          | ✅ 16 aprovados, 0 falhas (5 pulados: testes específicos de viewport) |

### Testes adicionados na fase

- **StatusBadge/STATUS_CONFIG**: completude — todos os valores dos 9 domínios
  (seções 9 e 7.6) têm rótulo pt-BR, tom e ícone, e todos renderizam.
- **Navegação**: ordem da sidebar (11.2), barra inferior e folha "Mais" (11.3),
  unicidade das rotas (11.1), resolução de módulo ativo por pathname.
- **ModulePlaceholder**: todos os módulos em preparação sem nenhum controle
  interativo (seção 0.2).
- **ConfirmDialog**: só executa após confirmação; cancelar não executa.
- **E2E (desktop/tablet/mobile)**: raiz → painel; navegação completa pela sidebar
  com `aria-current`; breadcrumb; barra inferior com alvos de toque ≥44px
  medidos; folha "Mais" abre, navega e fecha; **overflow horizontal testado em
  todas as 12 rotas**; axe (WCAG 2.2 AA) sem violações graves em painel,
  necessidades e design system; confirmação + toast de ponta a ponta.

### Verificação visual (evidências em `docs/qa/fase-1/`)

| Viewport | Capturas                                                                     |
| -------- | ---------------------------------------------------------------------------- |
| 390×844  | `dashboard-`, `necessidades-`, `design-system-`, `mais-sheet-mobile-390.png` |
| 768×1024 | `dashboard-`, `necessidades-`, `design-system-`, `mais-sheet-tablet-768.png` |
| 1440×900 | `dashboard-`, `necessidades-`, `design-system-desktop-1440.png`              |

Conferido manualmente: Fraunces nos títulos e Manrope no corpo; paleta do quarto
aplicada em sidebar, badges, cards e estados; folha "Mais" com radius 24px e
overlay discreto; navegação ativa em sage/moss com ícone `fill`; chip real
"Notion não conectado" (estado verdadeiro até a Fase 7); nenhum controle morto.

### Correções feitas durante o gate

- Contraste AA: textos pequenos sobre fundos suaves reprovavam (4,29:1) — criadas
  variantes `--*-strong` via `color-mix` e ajustado o MetricCard enfatizado (D-017).
- Cleanup da Testing Library registrado manualmente (sem `globals`, o automático
  não roda).

### Problemas conhecidos

| Sev. | Problema                                                                                               | Plano                              |
| ---- | ------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| P3   | Ícones PWA e marca definitiva pendentes                                                                | Fase 8 (manifest e instalação)     |
| P3   | Sidebar sem perfil/sair — dependem de autenticação                                                     | Fase 2 (decisão D-019)             |
| P3   | Placeholders não têm ação de navegação cruzada (por definição, sem controles até os módulos existirem) | resolve-se conforme módulos chegam |

Pendências P0/P1/P2: **nenhuma**.

---

## Fase 2 — Banco e autenticação · **IMPLEMENTADA (gate parcial)** · 12/07/2026

### Comandos do gate

| Verificação | Comando                | Resultado                                                              |
| ----------- | ---------------------- | ---------------------------------------------------------------------- |
| Lint        | `npm run lint`         | ✅ sem erros e sem warnings                                            |
| Formatação  | `npm run format:check` | ✅ todos os arquivos no padrão                                         |
| Tipos       | `npm run typecheck`    | ✅ sem erros                                                           |
| Unit + DB   | `npm run test`         | ✅ 12 arquivos, 53 testes (inclui Postgres 17 real via embedded)       |
| Build       | `npm run build`        | ✅ com `proxy.ts` ativo; rotas de auth dinâmicas                       |
| E2E         | `npm run e2e`          | ✅ 28 aprovados (testes com Supabase real ficam pulados até haver env) |

### O que os testes de integração provam (Postgres real)

- **Isolamento por household**: outra casa não vê, não insere, não atualiza
  dados alheios (RLS aplicada de fato).
- **Papéis (seção 4)**: colaboradora cria/edita; não exclui definitivamente,
  não vê/cria convites, não altera configurações nem fila de sync; owner sim.
  Ninguém muda o próprio papel (privilégio de coluna).
- **RPCs de entrada**: onboarding cria household+perfil+bebê+configurações;
  segundo onboarding é recusado; convite inexistente/expirado/reutilizado é
  recusado com mensagem clara.
- **Integridade**: decisão médica não pode ser "decidida" sem conclusão
  (seção 10.11); tarefa concluída exige data; conflito aberto é único por
  entidade+campo.
- **Seed (seção 38)**: aplica limpo, é idempotente, ≥30 necessidades nas 13
  categorias, entrega parcial com desconto+frete, item "precisa lavar",
  tarefa bloqueada, decisão médica pendente, item futuro, conflito aberto,
  erro de sync — e todos os pedidos respeitam `total = subtotal − desconto + frete`.

### Verificação visual (evidências em `docs/qa/fase-2/`)

`login-demo-*` (390/768/1440): tela de login em modo demonstração explicando a
configuração pendente, sem controles falsos. `familia-*`: Configurações >
Família. Banner "Sem autenticação" visível no app em modo demonstração, sem
overflow em 390px (regressão de overflow no header foi detectada pelos testes
e corrigida movendo o aviso para um banner de largura total).

### Pendência que impede a aprovação total da fase

| Item                                                                 | Situação                                                                                                                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login real, sessão persistente e convite de ponta a ponta (Supabase) | **Aguarda ação do Alisson**: criar o projeto e configurar as variáveis (guia `docs/setup-supabase.md`). Os e2e já preparados ativam sozinhos com as variáveis presentes. Não é defeito de código. |

### Problemas conhecidos

| Sev. | Problema                                                    | Plano                                                      |
| ---- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| P3   | Testes de banco não rodam como root (limitação do Postgres) | documentado (`su pgtest -c "npm run test"`); CI não é root |
| P3   | Tipos TS gerados do banco pendentes (`supabase gen types`)  | junto com a validação final da fase (D-025)                |

Pendências P0/P1/P2 de código: **nenhuma**.

---

## Fase 3 — Necessidades · **IMPLEMENTADA (gate parcial)** · 12/07/2026

### Comandos do gate

| Verificação | Comando                | Resultado                                                         |
| ----------- | ---------------------- | ----------------------------------------------------------------- |
| Lint        | `npm run lint`         | ✅ sem erros e sem warnings                                       |
| Formatação  | `npm run format:check` | ✅ todos os arquivos no padrão                                    |
| Tipos       | `npm run typecheck`    | ✅ sem erros                                                      |
| Unit + DB   | `npm run test`         | ✅ 16 arquivos, 82 testes                                         |
| Build       | `npm run build`        | ✅ novas rotas: lista, detalhe, nova, editar + `/api/needs(/:id)` |
| E2E         | `npm run e2e`          | ✅ 31 aprovados (fluxo autenticado pronto, ativa com credenciais) |

### Testes adicionados na fase

- **Cálculos (seção 10)**: cobertura `min(disp/nec, 1)`, prontidão de
  produto/consumível (20/25/20/15/20), tarefa e decisão, pesos 5/3/2/1,
  prontidão geral ponderada e item vencido — 18 casos, incluindo o princípio
  10.1 ("comprado ≠ pronto": entregue sem lavar = 80%).
- **Filtros (seção 16)**: ciclo parse↔serialize da URL sem perda, inválidos
  caem no padrão, busca sem acento ("berco" acha "Berço"), combinação de
  dimensões, "somente pendências" exclui prontos e descartados, arquivadas sob
  demanda, ordenação determinística.
- **Diff de histórico**: só campos alterados, com antes/depois.
- **Componente NeedsExplorer (jsdom)**: busca filtra e grava `?q=` na URL,
  toggle + visão por categoria combinam, estado "filtro sem resultado" com
  ação de recuperação.
- **E2E preparado (`needs.spec.ts`)**: login via link administrativo,
  onboarding, sessão persiste após refresh, criar necessidade, busca sem
  acento na URL, ação rápida persistida com histórico, arquivar/restaurar —
  **ativa automaticamente com as variáveis do Supabase**.

### Verificação visual (evidências em `docs/qa/fase-3/`)

`necessidades-demo-*` (390/768/1440): estado honesto sem Supabase. As telas com
dados reais (lista com filtros, detalhe, formulário) serão capturadas na
validação com Supabase — o layout já passou por axe e overflow nos três
viewports em modo demonstração.

### Pendência que impede a aprovação total da fase

A mesma da Fase 2: validação de ponta a ponta com Supabase real (credenciais —
`docs/setup-supabase.md`). O fluxo completo de necessidades já está roteirizado
em teste e roda sozinho quando as variáveis chegarem.

### Problemas conhecidos

| Sev. | Problema                                                                               | Plano                                   |
| ---- | -------------------------------------------------------------------------------------- | --------------------------------------- |
| P3   | Edição otimista fina (rollback visual) não implementada — ações usam transição + toast | refinar na validação com Supabase real  |
| P3   | Abas de relações do detalhe (produtos/compras/estoque/tarefas/decisões)                | Fases 4–5, junto com os módulos (D-029) |

Pendências P0/P1/P2 de código: **nenhuma**.

---

## Fases 4–9

Ainda não iniciadas. Cada fase adicionará aqui sua seção com: comandos do gate e
resultados, testes adicionados, verificação visual (mobile/tablet/desktop),
problemas conhecidos e pendências.
