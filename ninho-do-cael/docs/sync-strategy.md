# Estratégia de sincronização com o Notion

> **Documento vivo.** Consolida as seções 6.2, 6.3 e 7 do SDD. A implementação
> acontece na Fase 7; este documento é a referência de arquitetura que as fases
> anteriores devem respeitar (ex.: campos de sync no modelo de dados da Fase 2).

## Princípios

1. **Supabase é a fonte operacional.** Toda leitura e escrita da aplicação passa
   pelo Postgres do Supabase.
2. **Notion é fonte integrada e espelho sincronizado.** Continua útil para a
   família, mas não é a interface do produto.
3. **O navegador nunca acessa o token do Notion.** Toda a camada Notion vive no
   servidor (SDD, seção 6.2).
4. **Nenhuma tela consulta o Notion durante a renderização** — latência,
   disponibilidade e conflitos seriam incontroláveis (SDD, seção 32).
5. **Conflitos nunca são resolvidos silenciosamente.**

## Fluxos

```text
App → Supabase → fila de sincronização → job → Notion       (push)
Notion → webhook (ou reconciliação periódica) → Supabase    (pull)
```

- **Importação inicial (Fase 7):** pagina as seis fontes, normaliza, importa em
  duas passagens (entidades → relações), registra um `sync_run` com contagens e
  falhas, e é idempotente — repetir não duplica registros.
- **Push:** alterações no app são gravadas primeiro no Supabase e enfileiradas
  em `sync_queue` (entidade, registro, operação, payload, tentativas, próxima
  tentativa, erro, status, chave idempotente). Retentativa exponencial; após o
  limite, marca erro, notifica no app e oferece "Tentar novamente".
- **Pull:** webhook `POST /api/webhooks/notion` valida assinatura
  (`NOTION_WEBHOOK_SECRET`), responde rápido, persiste o evento bruto,
  deduplica e enfileira o processamento. A reconciliação periódica
  (protegida por `CRON_SECRET`) busca alterações desde a última sincronização
  e cobre webhooks perdidos.

## Estados de sincronização por registro

`synced` · `pending_push` · `pending_pull` · `conflict` · `error` · `not_linked`

## Conflitos

Um registro está em conflito quando mudou no app **e** no Notion após
`last_synced_at` (comparação por `sync_hash` + `notion_last_edited_time`).

- Resolução manual, campo a campo: manter valor do app, manter valor do Notion
  ou editar o valor final.
- **Nunca** resolver automaticamente conflitos de preço, quantidade, compra,
  logística, prontidão, prazo, responsável ou conclusão de decisão
  (SDD, seção 7.7).
- Falhas de sincronização são sempre visíveis (SyncIndicator + painel de sync);
  esconder falha é proibido (SDD, seção 0.1).

## Observabilidade

Cada execução registra métricas em `sync_runs` (direção, status, início, fim,
contadores, erro). O painel de sincronização mostra última execução, próxima,
sucessos, falhas, fila e conflitos abertos. Logs jamais contêm token ou
conteúdo sensível completo (SDD, seção 34).
