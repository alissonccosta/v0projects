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

## Fases 2–9

Ainda não iniciadas. Cada fase adicionará aqui sua seção com: comandos do gate e
resultados, testes adicionados, verificação visual (mobile/tablet/desktop),
problemas conhecidos e pendências.
