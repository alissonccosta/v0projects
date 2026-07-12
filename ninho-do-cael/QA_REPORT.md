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

## Fases 1–9

Ainda não iniciadas. Cada fase adicionará aqui sua seção com: comandos do gate e
resultados, testes adicionados, verificação visual (mobile/tablet/desktop),
problemas conhecidos e pendências.
