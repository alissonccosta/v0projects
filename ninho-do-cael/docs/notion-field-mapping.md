# Mapeamento Notion ↔ Ninho do Cael

> **Documento vivo.** Baseado nas seções 7 e 39 do SDD. Será completado na Fase 7,
> quando a importação real inspecionar os schemas das seis fontes e validar cada
> propriedade. Nenhuma parte deste mapeamento está em produção ainda.

## Fontes de dados (SDD, seção 7.1)

| Entidade                       | Data source ID                         | Variável de ambiente              |
| ------------------------------ | -------------------------------------- | --------------------------------- |
| Necessidades                   | `ce3fe570-7121-4e8f-a63a-0e89bbf11d28` | `NOTION_NEEDS_DATA_SOURCE_ID`     |
| Produtos e Alternativas        | `eec3bfd4-0785-4846-8355-552a83215e46` | `NOTION_PRODUCTS_DATA_SOURCE_ID`  |
| Aquisições e Pedidos           | `5703fbdc-8707-42b1-b08b-a59abcf0b903` | `NOTION_PURCHASES_DATA_SOURCE_ID` |
| Estoque e Prontidão            | `521896bd-ffaa-43fb-aa4e-9739a1bbc558` | `NOTION_INVENTORY_DATA_SOURCE_ID` |
| Tarefas, Serviços e Documentos | `221db659-addc-4b1c-a0e5-ad35a3d998c7` | `NOTION_TASKS_DATA_SOURCE_ID`     |
| Decisões e Validações          | `ccce3fe5-2a2e-4b63-ae83-925c3b4d6403` | `NOTION_DECISIONS_DATA_SOURCE_ID` |

## Campos de sincronização comuns (SDD, seção 7.5)

Todo registro sincronizado carrega: `notion_page_id`, `notion_url`,
`notion_last_edited_time`, `last_synced_at`, `sync_hash` e `sync_status`
(`synced`, `pending_push`, `pending_pull`, `conflict`, `error`, `not_linked`).

## Necessidades (SDD, seção 39)

| Propriedade no Notion    | Campo no app          |
| ------------------------ | --------------------- |
| Necessidade              | `title`               |
| Tipo                     | `type`                |
| Público                  | `audience`            |
| Categoria                | `category`            |
| Prioridade manual        | `priority`            |
| Criticidade              | `criticality`         |
| Fase                     | `phase`               |
| Status da decisão        | `decision_status`     |
| Status da aquisição      | `acquisition_status`  |
| Status logístico         | `logistics_status`    |
| Status de prontidão      | `readiness_status`    |
| Responsável              | `owner_type`          |
| Quantidade necessária    | `required_quantity`   |
| Quantidade disponível    | `available_quantity`  |
| Unidade                  | `unit`                |
| Preço estimado           | `estimated_price`     |
| Preço pago               | `paid_price`          |
| Data limite              | `due_date`            |
| Conteúdo original        | `original_content`    |
| Observações de auditoria | `audit_notes`         |
| Origem Notion            | `original_notion_url` |
| Produtos                 | relação               |
| Aquisições               | relação               |
| Estoque                  | relação               |
| Atividades               | relação               |
| Decisões                 | relação               |

**Regra de importação:** duas passagens — primeiro entidades, depois relações.
Relação ausente gera warning e segue; não aborta a importação (SDD, seção 39).

## Demais entidades

Produtos, Aquisições, Estoque, Tarefas e Decisões seguem os campos das seções
8.1 e 39 do SDD. O mapeamento propriedade-a-propriedade será preenchido na
Fase 7 com base na inspeção real dos schemas via API do Notion.
