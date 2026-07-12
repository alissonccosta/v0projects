# SDD — Ninho do Cael

## Sistema de Gestão Inteligente do Enxoval

**Versão:** 1.0  
**Data:** 11/07/2026  
**Status:** Pronto para implementação  
**Responsável pelo produto:** Alisson  
**Usuários principais:** Alisson e Duda  
**Bebê:** Cael  
**Cidade:** Itajaí, Santa Catarina, Brasil  
**Data prevista do parto:** 15/11/2026  
**Tipo de parto previsto:** cesárea  
**Maternidade prevista:** Santa Luiza / Unimed

---

# 0. INSTRUÇÃO OBRIGATÓRIA PARA O CODEX

Este arquivo é a especificação executiva, funcional, visual e técnica do produto.

Antes de escrever código:

1. Leia o SDD inteiro.
2. Inspecione o repositório e identifique se está vazio ou se existe código aproveitável.
3. Crie `IMPLEMENTATION_PLAN.md`, transformando as fases deste SDD em tarefas verificáveis.
4. Crie `DECISIONS.md` para registrar decisões técnicas não totalmente determinadas neste documento.
5. Crie `QA_REPORT.md` e mantenha-o atualizado durante a implementação.
6. Comece a implementação sem solicitar confirmação para decisões já especificadas.
7. Pergunte apenas quando houver impedimento real, como credenciais ausentes, acesso indisponível ou conflito impossível de resolver com segurança.

## 0.1 Regras inegociáveis

- Não criar um arquivo HTML monolítico.
- Não entregar uma demonstração estática.
- Não criar botões sem ação.
- Não usar `console.log()` como implementação de uma ação.
- Não exibir números hardcoded desconectados do banco.
- Não fingir sincronização com o Notion.
- Não armazenar token do Notion no navegador.
- Não armazenar `service_role` do Supabase no cliente.
- Não marcar uma funcionalidade como concluída sem testá-la.
- Não usar dados falsos silenciosamente.
- Não usar emoji como ícone da interface.
- Não usar o visual padrão do shadcn/ui sem personalização.
- Não usar azul corporativo, roxo SaaS, glassmorphism ou gradientes chamativos.
- Não criar layout que funcione apenas no desktop.
- Não permitir scroll horizontal em 390 px de largura.
- Não deixar texto, controles ou ações primárias cortados.
- Não esconder falhas de sincronização.
- Não sobrescrever silenciosamente alterações feitas no Notion ou no app.
- Não chamar o projeto de pronto enquanto `npm run build`, testes e verificação visual não passarem.

## 0.2 Critério para qualquer controle visível

Todo botão, menu, aba, filtro, seletor, link, checkbox, campo de busca e ação contextual deve atender uma destas condições:

1. Está funcional e testado.
2. Está explicitamente desabilitado, com motivo apresentado ao usuário.
3. Não aparece na interface.

Não existe quarta opção.

## 0.3 Evidências obrigatórias de conclusão

Ao terminar cada fase:

- executar lint;
- executar typecheck;
- executar testes correspondentes;
- executar build;
- verificar visualmente em desktop e mobile;
- atualizar `QA_REPORT.md`;
- registrar problemas conhecidos;
- só então iniciar a fase seguinte.

Ao finalizar o projeto, entregar:

- aplicação funcional;
- banco versionado por migrations;
- `.env.example`;
- dados seed;
- testes;
- documentação de setup;
- documentação da integração com Notion;
- capturas das telas principais;
- relatório de QA;
- URL de preview ou produção.

---

# 1. RESUMO DO PRODUTO

## 1.1 Nome

**Ninho do Cael**

## 1.2 Definição

Ninho do Cael é um aplicativo web responsivo e instalável, voltado à gestão completa do enxoval, preparação da maternidade, organização da casa e prontidão para a chegada e o desenvolvimento do Cael.

O sistema transforma uma base complexa, atualmente organizada no Notion, em uma experiência operacional simples, visual e confiável.

O Notion continua sendo uma fonte relevante e integrada, mas a interface principal de uso será o aplicativo.

## 1.3 Problema

A gestão do enxoval possui dados de naturezas diferentes:

- necessidades;
- produtos candidatos;
- compras;
- pedidos;
- entregas;
- estoque físico;
- lavagem;
- montagem;
- instalação;
- decisões familiares;
- decisões médicas;
- tarefas;
- documentos;
- prazos;
- fases de uso;
- custos;
- itens futuros.

Uma lista única não consegue representar isso adequadamente. Ela mistura decisão, compra e prontidão e cria falsas conclusões, como considerar um item “resolvido” apenas porque foi pago.

O sistema deve responder, sem esforço manual excessivo:

- O que realmente falta?
- O que já foi comprado?
- O que já foi entregue?
- O que está pronto para uso?
- O que precisa ser lavado, montado, instalado ou validado?
- Quais decisões dependem de Duda, Alisson, pediatra, obstetra ou maternidade?
- Quanto já foi gasto?
- Quanto ainda deve ser gasto?
- O que é urgente antes do parto?
- O que pode esperar três, seis ou doze meses?
- O que foi comprado cedo demais e deve permanecer armazenado?
- Quais itens possuem risco ou bloqueio?
- Qual o nível real de prontidão para a chegada do Cael?

## 1.4 Estado atual dos dados

A auditoria existente consolidou:

| Entidade                       |   Quantidade |
| ------------------------------ | -----------: |
| Necessidades                   |          131 |
| Produtos e alternativas        |           44 |
| Aquisições e pedidos           |           26 |
| Decisões e validações          |           30 |
| Tarefas, serviços e documentos |           39 |
| Valor pago reconstruído        | R$ 12.082,06 |

Esses números devem ser calculados pelo sistema, nunca copiados para cards como constantes.

---

# 2. VISÃO DO PRODUTO

## 2.1 Proposta de valor

Um sistema familiar que mostra a diferença entre:

- querer;
- decidir;
- comprar;
- receber;
- preparar;
- estar realmente pronto.

## 2.2 Resultado desejado

Alisson e Duda devem conseguir abrir o app no celular e, em poucos segundos:

- entender a situação geral;
- visualizar as próximas ações;
- registrar uma compra;
- confirmar uma entrega;
- atualizar a prontidão;
- consultar uma decisão;
- conferir o orçamento;
- localizar um item;
- saber o que pode esperar.

## 2.3 Princípios do produto

1. **Clareza precede quantidade.**
2. **Comprar não significa estar pronto.**
3. **A fase de uso importa mais que a empolgação da compra.**
4. **Segurança deve bloquear atalhos perigosos.**
5. **O sistema deve reduzir ansiedade, não criar trabalho burocrático.**
6. **Mobile é experiência principal, não adaptação tardia.**
7. **O Notion é integração, não interface do produto.**
8. **Nenhuma informação importante deve depender de memória humana.**
9. **Decisões médicas devem ser claramente separadas de decisões de compra.**
10. **A interface deve parecer parte do quarto do Cael, não um ERP bege.**

---

# 3. ESCOPO

## 3.1 Escopo do MVP funcional

O MVP deve incluir:

- autenticação;
- dashboard;
- cadastro e edição de necessidades;
- produtos e alternativas;
- aquisições e pedidos;
- estoque e prontidão;
- tarefas e serviços;
- decisões e validações;
- jornada por fase;
- orçamento;
- pesquisa global;
- filtros;
- histórico de alterações;
- integração inicial e contínua com Notion;
- importação;
- sincronização;
- resolução de conflitos;
- experiência mobile completa;
- PWA;
- exportação;
- seed de desenvolvimento;
- testes;
- deploy.

## 3.2 Fora do MVP

Não implementar na primeira versão:

- marketplace de produtos;
- cotação automática em lojas;
- rastreamento automático de transportadoras;
- IA conversacional;
- diagnóstico médico;
- recomendação clínica automatizada;
- notificações via WhatsApp;
- gestão de múltiplos bebês na interface;
- rede social;
- compartilhamento público;
- aplicativo nativo iOS ou Android;
- leitura automática de notas fiscais por OCR;
- integração bancária.

A arquitetura pode permitir evolução futura, mas nenhuma dessas frentes deve atrasar o MVP.

---

# 4. USUÁRIOS E PERMISSÕES

## 4.1 Alisson

Papel: administrador do Ninho.

Permissões:

- visualizar tudo;
- criar;
- editar;
- excluir logicamente;
- confirmar compras;
- confirmar entregas;
- atualizar estoque;
- concluir tarefas;
- registrar decisões;
- configurar integração;
- convidar Duda;
- resolver conflitos;
- exportar dados;
- consultar histórico.

## 4.2 Duda

Papel: colaboradora familiar.

Permissões:

- visualizar tudo;
- editar itens sob sua responsabilidade;
- atualizar necessidades e tarefas;
- registrar preferências;
- concluir ações;
- comentar decisões;
- consultar orçamento;
- criar itens;
- não pode alterar integração, credenciais ou excluir definitivamente dados.

## 4.3 Profissionais externos

Obstetra, pediatra, maternidade e outros profissionais não são usuários autenticados no MVP.

Eles aparecem como:

- responsáveis conceituais;
- fontes de decisão;
- dependências;
- registros de validação.

## 4.4 Modelo de autorização

Usar um `household_id` para isolar os dados.

Mesmo sendo inicialmente uma única família, todas as tabelas operacionais devem conter `household_id`.

Aplicar Row Level Security em todas as tabelas privadas.

Papéis:

- `owner`;
- `collaborator`.

---

# 5. OBJETIVOS E MÉTRICAS

## 5.1 Objetivos

### O1. Visibilidade

Mostrar a situação real do enxoval em uma tela.

### O2. Prontidão

Distinguir compra, entrega e preparo.

### O3. Execução

Transformar necessidades em ações com prazo e responsável.

### O4. Controle financeiro

Reconciliar orçamento, compras, descontos, fretes e estimativas.

### O5. Segurança

Evidenciar bloqueios, riscos e decisões profissionais pendentes.

### O6. Continuidade

Manter integração confiável com o Notion.

## 5.2 Métricas de produto

- percentual de necessidades críticas prontas;
- percentual de necessidades antes do parto prontas;
- tarefas vencidas;
- tarefas bloqueadas;
- decisões médicas pendentes;
- compras aguardando envio;
- compras sem confirmação de entrega;
- itens entregues ainda não preparados;
- valor pago;
- valor estimado pendente;
- cobertura de quantidades;
- taxa de sincronização bem-sucedida;
- conflitos de sincronização abertos;
- tempo médio para encontrar um item;
- taxa de ações concluídas no celular.

---

# 6. ARQUITETURA RECOMENDADA

## 6.1 Stack obrigatória

### Frontend e backend web

- Next.js com App Router;
- TypeScript estrito;
- React Server Components por padrão;
- Client Components somente onde houver interação;
- Route Handlers para APIs internas;
- Server Actions apenas quando simplificarem formulários sem prejudicar testabilidade.

### Interface

- Tailwind CSS;
- shadcn/ui como base de componentes, totalmente tematizado;
- Radix Primitives quando necessário;
- Phosphor Icons;
- Recharts para gráficos;
- React Hook Form;
- Zod;
- Sonner ou equivalente para feedback de ações;
- date-fns com locale `pt-BR`.

### Dados

- Supabase Postgres;
- Supabase Auth;
- Supabase Row Level Security;
- Supabase Realtime somente onde trouxer valor;
- migrations SQL versionadas;
- tipos TypeScript gerados a partir do banco.

### Sincronização

- SDK oficial do Notion no servidor;
- webhooks do Notion quando configurados;
- job de reconciliação periódico como proteção;
- fila persistente de sincronização;
- idempotência.

### Qualidade

- ESLint;
- Prettier;
- Vitest;
- Testing Library;
- Playwright;
- axe-core ou integração equivalente;
- GitHub Actions.

### Deploy

- Vercel para a aplicação;
- Supabase para banco e autenticação.

## 6.2 Por que não usar o Notion diretamente no cliente

O navegador nunca deve acessar o token do Notion.

O Notion também não deve ser consultado a cada abertura de tela, porque isso:

- aumenta latência;
- dificulta filtros e agregações;
- torna o app dependente da disponibilidade da API;
- complica histórico;
- prejudica experiência offline;
- aumenta risco de conflito.

## 6.3 Fonte operacional

- Supabase é a fonte operacional da aplicação.
- Notion é a fonte integrada e um espelho sincronizado.
- A importação inicial preserva todos os IDs do Notion.
- Alterações no app são gravadas primeiro no Supabase.
- Depois são enviadas ao Notion por job.
- Alterações no Notion chegam por webhook ou reconciliação.
- Conflitos nunca são sobrescritos silenciosamente.

## 6.4 Diagrama lógico

```text
Usuário
  |
  v
Next.js App
  |
  +--> Supabase Auth
  |
  +--> Supabase Postgres
  |       |
  |       +--> Dados operacionais
  |       +--> Histórico
  |       +--> Fila de sincronização
  |       +--> Conflitos
  |
  +--> Camada server-side Notion
          |
          +--> Importação inicial
          +--> Push de alterações
          +--> Webhooks
          +--> Reconciliação periódica
```

---

# 7. INTEGRAÇÃO COM NOTION

## 7.1 Fontes atuais

| Entidade                       | Data source ID                         |
| ------------------------------ | -------------------------------------- |
| Necessidades                   | `ce3fe570-7121-4e8f-a63a-0e89bbf11d28` |
| Produtos e Alternativas        | `eec3bfd4-0785-4846-8355-552a83215e46` |
| Aquisições e Pedidos           | `5703fbdc-8707-42b1-b08b-a59abcf0b903` |
| Estoque e Prontidão            | `521896bd-ffaa-43fb-aa4e-9739a1bbc558` |
| Tarefas, Serviços e Documentos | `221db659-addc-4b1c-a0e5-ad35a3d998c7` |
| Decisões e Validações          | `ccce3fe5-2a2e-4b63-ae83-925c3b4d6403` |

## 7.2 Página principal

`https://app.notion.com/p/39a1c97d43e78156afa8de54a395896b`

## 7.3 Variáveis de ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NOTION_ACCESS_TOKEN=
NOTION_WEBHOOK_SECRET=
NOTION_VERSION=2026-03-11

NOTION_NEEDS_DATA_SOURCE_ID=ce3fe570-7121-4e8f-a63a-0e89bbf11d28
NOTION_PRODUCTS_DATA_SOURCE_ID=eec3bfd4-0785-4846-8355-552a83215e46
NOTION_PURCHASES_DATA_SOURCE_ID=5703fbdc-8707-42b1-b08b-a59abcf0b903
NOTION_INVENTORY_DATA_SOURCE_ID=521896bd-ffaa-43fb-aa4e-9739a1bbc558
NOTION_TASKS_DATA_SOURCE_ID=221db659-addc-4b1c-a0e5-ad35a3d998c7
NOTION_DECISIONS_DATA_SOURCE_ID=ccce3fe5-2a2e-4b63-ae83-925c3b4d6403

CRON_SECRET=
APP_URL=
```

## 7.4 Importação inicial

1. Usuário abre Configurações > Integração.
2. Sistema valida credencial e acesso às seis fontes.
3. Sistema mostra prévia com quantidade por fonte, erros e duplicidades.
4. Usuário inicia importação.
5. O backend pagina todas as fontes.
6. Cada registro é normalizado.
7. Relações são importadas após entidades-base.
8. Um `sync_run` registra início, fim, contagens e falhas.
9. A interface mostra progresso.
10. Importação pode ser repetida sem duplicar registros.

## 7.5 Identificadores

Cada registro sincronizado deve possuir:

- `notion_page_id`;
- `notion_url`;
- `notion_last_edited_time`;
- `last_synced_at`;
- `sync_hash`;
- `sync_status`.

## 7.6 Estados de sincronização

- `synced`;
- `pending_push`;
- `pending_pull`;
- `conflict`;
- `error`;
- `not_linked`.

## 7.7 Conflito

Considerar conflito quando o registro mudou no app e no Notion após `last_synced_at`.

Tela de resolução:

- mostrar valor do app;
- mostrar valor do Notion;
- mostrar data e origem;
- permitir manter app, manter Notion ou editar valor final;
- permitir resolver campo a campo.

Nunca resolver automaticamente conflitos de preço, quantidade, compra, logística, prontidão, prazo, responsável ou conclusão de decisão.

## 7.8 Fila de sincronização

Tabela persistente com entidade, registro, operação, payload, tentativas, próxima tentativa, erro, status e chave idempotente.

Usar retentativa exponencial. Após o limite:

- marcar erro;
- notificar no app;
- oferecer “Tentar novamente”.

## 7.9 Webhook

Endpoint: `POST /api/webhooks/notion`

Requisitos:

- validar assinatura;
- responder rapidamente;
- persistir evento bruto;
- não processar toda a carga na resposta;
- deduplicar;
- enfileirar reconciliação.

## 7.10 Reconciliação periódica

- buscar registros alterados desde a última sincronização;
- comparar hashes;
- atualizar;
- gerar conflitos;
- registrar métricas;
- oferecer botão “Sincronizar agora”.

---

# 8. MODELO DE DADOS

## 8.1 Entidades principais

### households

- `id uuid primary key`;
- `name text not null`;
- `timezone text default 'America/Sao_Paulo'`;
- `currency text default 'BRL'`;
- timestamps.

### profiles

- `id uuid primary key references auth.users`;
- `household_id uuid`;
- `display_name text`;
- `role owner|collaborator`;
- `avatar_url text nullable`;
- timestamps.

### babies

- `id uuid`;
- `household_id uuid`;
- `name text`;
- `due_date date`;
- `planned_birth_type text`;
- `maternity text`;
- `city text`;
- `state text`;
- timestamps.

Seed: Cael, 2026-11-15, Cesárea, Santa Luiza / Unimed, Itajaí, SC.

### needs

- identificação e `household_id`;
- título;
- tipo;
- público;
- categoria;
- prioridade;
- criticidade;
- fase;
- status de decisão;
- status de aquisição;
- status logístico;
- status de prontidão;
- responsável;
- quantidades;
- unidade;
- preços;
- prazo;
- conteúdo original;
- notas de auditoria;
- origem;
- soft delete;
- campos de sincronização;
- timestamps.

### products

- identificação e família;
- nome;
- marca;
- modelo;
- variação;
- cor;
- tamanho;
- status;
- loja;
- URL;
- preço de referência;
- preço pago;
- compatibilidade;
- motivo;
- conteúdo original;
- campos de sincronização;
- timestamps.

### need_products

Relação N:N com `is_preferred`.

### purchases

- título;
- tipo;
- status;
- fornecedor;
- pagamento;
- pedido;
- rastreio;
- data;
- entrega prevista;
- entrega real;
- subtotal;
- desconto;
- frete;
- total;
- notas;
- sync;
- timestamps.

### purchase_items

- compra;
- produto opcional;
- necessidade opcional;
- descrição;
- quantidade;
- valor unitário;
- desconto rateado;
- frete rateado;
- total.

### inventory_items

- necessidade;
- produto;
- nome;
- quantidade;
- condição;
- prontidão;
- local;
- origem;
- validade;
- lote;
- notas;
- sync;
- timestamps.

### tasks

- título;
- tipo;
- categoria;
- status;
- responsável;
- prazo;
- intervalo;
- custo estimado;
- dependências;
- critério de conclusão;
- conteúdo original;
- conclusão;
- sync;
- timestamps.

### decisions

- título;
- tipo;
- status;
- responsável;
- confiança;
- data;
- prazo;
- conclusão;
- justificativa;
- fonte;
- impacto;
- pergunta pendente;
- conteúdo original;
- sync;
- timestamps.

### activity_logs

- actor;
- entidade;
- ação;
- mudanças JSON;
- origem app/notion/system;
- timestamp.

### sync_runs

- direção;
- status;
- início;
- fim;
- contadores;
- erro.

### sync_queue

- entidade;
- registro;
- operação;
- payload;
- idempotência;
- status;
- tentativas;
- próxima tentativa;
- erro.

### sync_conflicts

- entidade;
- registro;
- campo;
- valor do app;
- valor do Notion;
- datas;
- status;
- resolução;
- responsável.

### household_settings

- tema;
- itens futuros;
- home padrão;
- limite de alerta financeiro;
- sync;
- aceite de aviso médico.

---

# 9. ENUMS E DOMÍNIOS

## 9.1 Categorias

Sono, Amamentação, Higiene, Transporte, Roupas, Fraldas, Maternidade, Pós-parto, Quarto, Desenvolvimento, Segurança, Documentos e Alimentação.

## 9.2 Fases

Antes do parto, 0–3 meses, 3–6 meses, 6–12 meses, Após 12 meses e Contínuo.

## 9.3 Criticidade

Crítica, Alta, Média, Baixa.

## 9.4 Prioridade

Alta, Média, Baixa.

## 9.5 Status de decisão da necessidade

- precisa_pesquisar;
- pesquisando;
- comparando;
- escolhido;
- adiado;
- decisao_profissional_pendente;
- descartado.

## 9.6 Status de aquisição

- aguardar;
- aguardando_compra;
- elegivel_para_cha;
- comprado;
- ja_possui;
- nao_comprar.

## 9.7 Status logístico

- nao_aplicavel;
- nao_confirmado;
- aguardando_envio;
- enviado;
- entregue;
- devolvido;
- cancelado.

## 9.8 Status de prontidão

- nao_aplicavel;
- pendente;
- precisa_higienizar;
- precisa_lavar;
- precisa_esterilizar;
- precisa_arejar;
- precisa_montar;
- precisa_instalar;
- precisa_configurar;
- precisa_validar;
- pronto_para_uso.

## 9.9 Tarefas

planejada, em_andamento, bloqueada, concluida, cancelada.

## 9.10 Decisões

pendente, em_analise, aguardando_profissional, decidida, revisar_depois, descartada.

---

# 10. REGRAS DE NEGÓCIO

## 10.1 Compra não significa prontidão

Um item comprado não é considerado pronto se não foi entregue ou se ainda precisa ser lavado, higienizado, esterilizado, montado, instalado, configurado, validado ou arejado.

## 10.2 Cobertura de quantidade

```text
coverage = min(available_quantity / required_quantity, 1)
```

## 10.3 Prontidão individual

### Produto ou consumível

- decisão resolvida: 20%;
- aquisição adequada: 25%;
- logística concluída: 20%;
- quantidade coberta: 15%;
- prontidão física: 20%.

### Tarefa ou serviço

- planejada: 0%;
- em andamento: 50%;
- bloqueada: 20%;
- concluída: 100%;
- cancelada: excluída se substituída, senão 0%.

### Decisão

- pendente: 0%;
- em análise: 35%;
- aguardando profissional: 35%;
- decidida: 100%;
- revisar depois: 60%;
- descartada: 100% quando conscientemente encerrada.

## 10.4 Peso por criticidade

| Criticidade | Peso |
| ----------- | ---: |
| Crítica     |    5 |
| Alta        |    3 |
| Média       |    2 |
| Baixa       |    1 |

## 10.5 Prontidão geral

```text
overall_readiness =
sum(item_readiness * criticality_weight)
/
sum(criticality_weight)
```

Mostrar prontidão geral, antes do parto, por categoria, fase e apenas itens críticos.

## 10.6 Item vencido

Data anterior à atual, não concluído, não descartado e não pronto.

## 10.7 Compra comprometida

Somar compras confirmadas, aguardando envio, enviadas e entregues. Não somar estimativas, canceladas ou alternativas.

## 10.8 Valor pendente estimado

Somar estimativas de itens aguardando compra e serviços não contratados. Excluir comprado, já possui, não comprar e fases futuras quando o modo for “até o parto”.

## 10.9 Valores de pedidos

```text
total_paid = subtotal - discount + shipping
```

Alertar divergência superior a R$ 0,01.

## 10.10 Exclusão

Usar soft delete, histórico e restauração.

## 10.11 Decisões médicas

- marcador profissional;
- sem recomendação automática;
- conclusão obrigatória;
- aviso de que o sistema não substitui orientação profissional.

---

# 11. ARQUITETURA DA INFORMAÇÃO

## 11.1 Rotas

```text
/login
/app/dashboard
/app/necessidades
/app/necessidades/[id]
/app/produtos
/app/produtos/[id]
/app/compras
/app/compras/[id]
/app/estoque
/app/tarefas
/app/tarefas/[id]
/app/decisoes
/app/decisoes/[id]
/app/jornada
/app/orcamento
/app/atividade
/app/configuracoes
/app/configuracoes/familia
/app/configuracoes/integracoes
/app/configuracoes/sincronizacao
/app/configuracoes/dados
```

## 11.2 Navegação desktop

Sidebar: Início, Necessidades, Compras, Estoque, Tarefas, Decisões, Jornada, Orçamento e Configurações.

Rodapé: sincronização, perfil e sair.

## 11.3 Navegação mobile

Barra inferior: Início, Necessidades, Tarefas, Compras e Mais.

“Mais”: Estoque, Decisões, Jornada, Orçamento e Configurações.

FAB contextual, nunca múltiplos FABs simultâneos.

---

# 12. DESIGN SYSTEM

## 12.1 Direção visual

A interface deve refletir o quarto do Cael: Montessori contemporâneo, escandinavo suave, natural, silencioso, organizado, acolhedor e funcional.

Referências: cama verde/oliva, paredes creme e verde suave, floresta discreta, madeira natural, palhinha, cômoda amadeirada, tapete de folha, tatame creme e verde-musgo, persiana bege e luz quente.

## 12.2 Paleta

| Token          | Hex       | Uso               |
| -------------- | --------- | ----------------- |
| canvas         | `#F5F0E6` | fundo principal   |
| surface        | `#FFFDF8` | cards             |
| surface-muted  | `#EEE7DA` | áreas secundárias |
| sand           | `#D8CBB8` | bordas e chips    |
| rattan         | `#C7A77D` | detalhes          |
| wood           | `#9A6B49` | acentos           |
| sage-100       | `#DDE5D7` | seleção           |
| sage-300       | `#B4C1AA` | bordas e gráficos |
| sage-500       | `#819174` | ações secundárias |
| olive-600      | `#617055` | ação principal    |
| moss-700       | `#465441` | navegação ativa   |
| forest-900     | `#29352C` | texto e header    |
| success        | `#5F7D5C` | sucesso           |
| warning        | `#B3833E` | alerta            |
| danger         | `#A65D4F` | erro              |
| info           | `#667D7A` | informação        |
| text-primary   | `#2D342E` | texto             |
| text-secondary | `#687067` | secundário        |

## 12.3 Restrições visuais

Não usar roxo, azul elétrico, rosa bebê, ícones aleatórios, sombras pesadas, bordas pretas, glassmorphism, gradientes decorativos, excesso de cards, mascotes ou aparência de ERP corporativo.

## 12.4 Tipografia

- títulos: Fraunces;
- interface: Manrope;
- fallback: system-ui.

## 12.5 Espaçamento

Sistema de 4 px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

## 12.6 Radius

- input: 12 px;
- card: 18 px;
- modal: 24 px;
- chip: 999 px.

## 12.7 Ícones

Phosphor Icons, 16/20/24 px, peso consistente.

## 12.8 Motion

120–220 ms, respeitar reduced motion, usar apenas para explicar mudanças.

---

# 13. RESPONSIVIDADE

## 13.1 Viewports obrigatórios

390×844, 430×932, 768×1024, 1024×768 e 1440×900.

## 13.2 Mobile

- mobile-first;
- uma coluna;
- toque mínimo 44×44;
- filtros em bottom sheet;
- detalhe em full-screen sheet;
- tabelas viram listas;
- teclado não esconde salvar;
- sem sidebar;
- sem overflow horizontal.

## 13.3 Desktop

- sidebar 224–248 px;
- header 64–72 px;
- grid de 12 colunas;
- tabelas para listas densas;
- drawer de 440–560 px.

## 13.4 Estados obrigatórios

Loading, vazio, erro, sem conexão, sincronizando, conflito, sucesso, sem permissão e filtro sem resultado.

---

# 14. COMPONENTES ESSENCIAIS

## AppShell

Sidebar, app bar, breadcrumbs, sincronização, navegação, perfil e conteúdo responsivo.

## MetricCard

Título, valor, unidade, contexto, ícone e ação opcional. Prontidão geral possui maior hierarquia.

## StatusBadge

Componente único que recebe domínio, valor, ícone e tamanho. Mapeamento centralizado.

## NeedCard

Título, categoria, criticidade, fase, aquisição, prontidão, quantidade, responsável, prazo e bloqueio.

## NeedTable

Colunas configuráveis: necessidade, categoria, criticidade, fase, aquisição, logística, prontidão, quantidade, responsável, prazo e valor.

## DetailDrawer

Abas: Resumo, Produtos, Compras, Estoque, Tarefas, Decisões, Histórico e Sincronização.

## QuickUpdate

Atualização real de entrega, quantidade, prontidão, tarefa e decisão.

## SyncIndicator

Sincronizado, pendente, sincronizando, conflito, erro e offline.

## EmptyState

Explica o vazio e apresenta ação útil.

## ConfirmDialog

Arquivar, cancelar, marcar não comprar, resolver conflito, remover relação e reimportar.

---

# 15. DASHBOARD

## 15.1 Objetivo

Responder “como estamos?” e “o que fazer agora?”.

## 15.2 Cabeçalho

Ninho do Cael, data, contagem regressiva, sincronização e ação rápida.

## 15.3 Bloco principal

### Prontidão

- percentual geral;
- percentual antes do parto;
- itens críticos;
- ação “Ver pendências”.

### Contagem regressiva

- dias até 15/11/2026;
- fase;
- próximo marco;
- sem transformar em previsão médica.

### Financeiro

- valor pago;
- pendente estimado;
- economia;
- pedidos aguardando entrega.

## 15.4 Próximas ações

Ordenar: vencido, crítico, prazo, bloqueador, alta prioridade e restante.

Cada item: ação, responsável, prazo, dependência e atualização.

## 15.5 Alertas acionáveis

- decisão médica;
- compra sem entrega;
- entregue sem preparo;
- tarefa bloqueada;
- quantidade insuficiente;
- conflito;
- pedido atrasado;
- custo divergente.

## 15.6 Gráficos

Prontidão por categoria, gastos por categoria, compras por status e cronograma por fase.

## 15.7 Atividade recente

Quem, o quê, origem e quando.

---

# 16. MÓDULO NECESSIDADES

## Lista

Busca, filtros por categoria, fase, criticidade, responsável, aquisição, logística e prontidão, além de “antes do parto”, “somente pendências” e “somente críticas”. Filtros persistem na URL.

## Visualizações

Lista, categoria, fase, prontidão e responsável. Não usar Kanban se drag-and-drop não funcionar.

## Criar

Obrigatórios: título, tipo, público, categoria, fase, criticidade, prioridade, decisão, aquisição, logística, prontidão e responsável.

Opcionais: quantidades, unidade, preço, prazo, notas e origem.

## Editar

Edição otimista, rollback, histórico, fila Notion e feedback.

## Detalhe

Situação, motivo, falta, próxima ação, relações, Notion e histórico.

## Ações rápidas

Marcar comprado, confirmar entrega, quantidade, pronto, criar tarefa, decisão e arquivar.

## Critérios de aceite

- filtros combinam;
- busca ignora acento;
- URL preserva filtros;
- criar e editar persistem;
- relações aparecem;
- sync é enfileirado;
- mobile sem overflow;
- 131 registros sem travamento perceptível.

---

# 17. PRODUTOS E ALTERNATIVAS

Cadastrar, relacionar, comparar, marcar preferido, registrar compatibilidade, preços, link, loja e descarte.

Comparador de até quatro produtos com marca, modelo, preço, compatibilidade, status, razão e observações.

---

# 18. COMPRAS E PEDIDOS

## Lista

Título, fornecedor, data, status, total, entrega, rastreio e quantidade de itens.

## Registrar compra

Fornecedor, data, pagamento, pedido, subtotal, desconto, frete, total, itens, quantidades, rateio, entrega e notas.

## Entrega

Checklist: data, itens, quantidades, avaria, peças, manual, devolução, prontidão e local.

Ao confirmar:

- atualizar pedido;
- criar estoque;
- atualizar necessidade;
- criar tarefa de preparo;
- registrar histórico;
- sincronizar.

## Devolução

Parcial ou total, motivo, valor, status e impacto.

---

# 19. ESTOQUE E PRONTIDÃO

Visualizações por prontidão, local, categoria, quantidade insuficiente e validade.

Ações: quantidade, local, condição, lavado, higienizado, esterilizado, montado, instalado, configurado, validado e pronto.

Lote de preparo para lavagem, higienização e armazenamento, com validação de compatibilidade.

---

# 20. TAREFAS E SERVIÇOS

Visualizações: semana, calendário, lista, status, responsável, bloqueadas e antes do parto.

Campos: título, tipo, categoria, status, responsável, prazo, intervalo, custo, dependências, critério e necessidades.

Conclusão exige confirmação do critério e permite nota, custo real e referência.

Bloqueada exibe dependência, bloqueador, ação e responsável.

---

# 21. DECISÕES E VALIDAÇÕES

Tipos: Familiar, Técnica, Médica, Segurança e Financeira.

Separar: exigem ação, aguardando profissional, decididas, revisar depois e descartadas.

Campos: pergunta, tipo, responsável, prazo, conclusão, justificativa, fonte, confiança, impacto e necessidades.

Decisões médicas não recebem conclusão automática e mantêm aviso e histórico.

---

# 22. JORNADA

Fases: Antes do parto, 0–3, 3–6, 6–12, Após 12 e Contínuo.

Cada fase mostra resumo, necessidades, compras, tarefas, decisões, prontidão, gasto e marcos.

Itens futuros não poluem a urgência atual. Toggle “Mostrar itens futuros”.

---

# 23. ORÇAMENTO

Indicadores: pago, comprometido, pendente, economizado, frete, desconto, categoria, fase e fornecedor.

Regras:

- não duplicar kits;
- compra é fonte financeira;
- produto é referência;
- necessidade usa estimativa sem compra;
- frete e desconto separados;
- divergências alertadas.

Gráficos: barras por categoria, evolução acumulada, pago x pendente e fornecedores.

---

# 24. PESQUISA GLOBAL

Atalho `/` no desktop. Buscar necessidades, produtos, compras, tarefas e decisões. Ignorar acento, priorizar título e navegar ao detalhe.

---

# 25. NOTIFICAÇÕES NO APP

Tarefas vencidas, prazo próximo, entrega, conflito, sync, decisão profissional e item crítico.

Central com marcar como lida, abrir origem e dispensar.

Sem push externo no MVP.

---

# 26. ATIVIDADE E AUDITORIA

Toda alteração relevante gera log com entidade, ação, antes, depois, usuário, origem e horário.

---

# 27. AUTENTICAÇÃO

Magic link, sessão persistente e logout.

Owner confirma família, Cael, Notion e importa. Colaborador entra por convite.

Rotas protegidas e autorização por servidor + RLS.

---

# 28. PWA E OFFLINE

Manifest, ícones, tema, instalação e standalone.

Offline: visualizar último estado, indicar offline e sincronizar depois. Se escrita offline não for robusta, permitir apenas leitura e explicar.

---

# 29. API INTERNA

```ts
type ApiResult<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: { code: string; message: string; details?: unknown } };
```

Endpoints:

```text
GET/POST /api/needs
GET/PATCH/DELETE /api/needs/:id
GET/POST /api/products
PATCH /api/products/:id
GET/POST /api/purchases
GET/PATCH /api/purchases/:id
POST /api/purchases/:id/deliver
POST /api/purchases/:id/return
GET /api/inventory
PATCH /api/inventory/:id
POST /api/inventory/batch-readiness
GET/POST /api/tasks
PATCH /api/tasks/:id
POST /api/tasks/:id/complete
GET/POST /api/decisions
PATCH /api/decisions/:id
GET /api/dashboard
GET /api/search
GET /api/activity
POST /api/sync/import
POST /api/sync/run
GET /api/sync/status
GET /api/sync/conflicts
POST /api/sync/conflicts/:id/resolve
POST /api/webhooks/notion
```

Todo input passa por Zod.

---

# 30. ESTRUTURA DE PASTAS

```text
src/
  app/
    (auth)/login/
    (app)/
      dashboard/
      necessidades/
      produtos/
      compras/
      estoque/
      tarefas/
      decisoes/
      jornada/
      orcamento/
      atividade/
      configuracoes/
    api/
  components/
    app-shell/
    dashboard/
    needs/
    products/
    purchases/
    inventory/
    tasks/
    decisions/
    journey/
    budget/
    sync/
    ui/
  features/
  lib/
    supabase/
    notion/
    auth/
    permissions/
    validation/
    calculations/
    formatters/
    observability/
  server/
    repositories/
    services/
    sync/
    jobs/
  styles/
  types/

supabase/
  migrations/
  seed.sql

tests/
  e2e/
  integration/
  fixtures/

public/
  icons/
  brand/

docs/
  notion-field-mapping.md
  sync-strategy.md
  deployment.md

IMPLEMENTATION_PLAN.md
DECISIONS.md
QA_REPORT.md
README.md
.env.example
```

Regras: componentes não acessam Supabase diretamente, lógica de negócio não fica em JSX, status centralizados, cálculos testados e Notion isolado.

---

# 31. ACESSIBILIDADE

Atender WCAG 2.2 AA: contraste, foco, labels, teclado, semântica, erros associados, não depender de cor, área de toque, reduced motion, tabelas, focus trap, aria-live e resumo textual de gráficos.

---

# 32. PERFORMANCE

Metas:

- conteúdo útil abaixo de 2,5 s em móvel razoável;
- interação local abaixo de 200 ms;
- paginação/virtualização quando necessário;
- agregados no servidor;
- evitar N+1;
- cache controlado;
- imagens otimizadas;
- bundle monitorado.

Não consultar as seis fontes do Notion durante renderização.

---

# 33. SEGURANÇA

- segredos no servidor;
- RLS;
- validação de household;
- rate limiting;
- webhook validado;
- logs sem tokens;
- CSP;
- proteção CSRF;
- URL sanitizada;
- não renderizar HTML arbitrário do Notion;
- auditoria;
- backup;
- menor privilégio;
- arquivos privados.

Dados médicos são sensíveis e não devem ir para analytics externos sem necessidade.

---

# 34. OBSERVABILIDADE

Registrar erros, banco, sync, webhook, conflito, importação e latência.

Nunca registrar token, cookie, credencial ou conteúdo sensível completo.

Painel de sync: última execução, próxima, sucessos, falhas, fila e conflitos.

---

# 35. TESTES

## Unitários

Cálculos financeiros, prontidão, cobertura, prioridade, status, mapping, hash, conflito e formatação.

## Integração

CRUD, RLS, auth, import, push, pull, fila, entrega, estoque e arquivamento.

## E2E obrigatórios

1. login;
2. dashboard;
3. filtro;
4. criar necessidade;
5. editar;
6. registrar compra;
7. confirmar entrega;
8. atualizar prontidão;
9. concluir tarefa;
10. registrar decisão;
11. sincronizar;
12. resolver conflito;
13. mobile;
14. instalar PWA;
15. logout.

## Visual

Capturas de dashboard, necessidades, drawer, compra, tarefas, decisões, sync, vazio, erro e loading em mobile e desktop.

---

# 36. ESTADOS DE ERRO

## Salvamento falhou

Manter formulário, mostrar erro, retry, não fechar e não fingir sucesso.

## Sync falhou

Dado local permanece, status pendente, erro e retry.

## Notion indisponível

App continua, banner discreto, CRUD local não bloqueia.

## Supabase indisponível

Leitura cacheada quando possível, escrita desabilitada e explicação.

## Sem dados

Orientar importação ou criação.

---

# 37. CONTEÚDO E TOM

Português do Brasil, claro, familiar, direto, respeitoso, sem voz de IA, sem frases motivacionais e sem infantilização.

Bom:

- “3 itens críticos ainda precisam ser preparados.”
- “A entrega foi confirmada. Falta lavar antes do uso.”
- “Esta decisão depende do obstetra.”

Ruim:

- “O quartinho dos sonhos está quase prontinho!”
- “Parabéns, papais!”
- “A magia está acontecendo!”

---

# 38. SEED DE DESENVOLVIMENTO

Criar seed com Cael, Alisson owner, Duda collaborator, pelo menos 30 necessidades, todas as categorias, status variados, compras com desconto/frete, entrega parcial, item que precisa lavar, tarefa bloqueada, decisão médica, item futuro, conflito e erro de sync.

Seed claramente identificado. Nunca misturar em produção.

---

# 39. MAPEAMENTO DO NOTION

## Necessidades

| Notion                   | App                 |
| ------------------------ | ------------------- |
| Necessidade              | title               |
| Tipo                     | type                |
| Público                  | audience            |
| Categoria                | category            |
| Prioridade manual        | priority            |
| Criticidade              | criticality         |
| Fase                     | phase               |
| Status da decisão        | decision_status     |
| Status da aquisição      | acquisition_status  |
| Status logístico         | logistics_status    |
| Status de prontidão      | readiness_status    |
| Responsável              | owner_type          |
| Quantidade necessária    | required_quantity   |
| Quantidade disponível    | available_quantity  |
| Unidade                  | unit                |
| Preço estimado           | estimated_price     |
| Preço pago               | paid_price          |
| Data limite              | due_date            |
| Conteúdo original        | original_content    |
| Observações de auditoria | audit_notes         |
| Origem Notion            | original_notion_url |
| Produtos                 | relation            |
| Aquisições               | relation            |
| Estoque                  | relation            |
| Atividades               | relation            |
| Decisões                 | relation            |

Importar em duas passagens: entidades e relações. Relação ausente gera warning, não aborta tudo.

---

# 40. FASES DE IMPLEMENTAÇÃO

## Fase 0 — Preparação

Projeto, dependências, lint, formatter, env, CI, docs, plano e QA. Gate: sobe, lint, typecheck e build.

## Fase 1 — Design system e shell

Tokens, fontes, componentes, sidebar, mobile nav, header e responsividade. Gate: capturas 390/768/1440, sem overflow e navegação funcional.

## Fase 2 — Banco e auth

Migrations, RLS, seed, auth, household, profiles e baby. Gate: isolamento, login, sessão e convite.

## Fase 3 — Necessidades

Lista, filtros, detalhe, CRUD, histórico e cálculos. Gate: persistência, mobile e testes.

## Fase 4 — Produtos, compras e estoque

Produtos, compras, itens, entrega, estoque, prontidão e financeiro. Gate: compra → entrega → estoque → prontidão.

## Fase 5 — Tarefas, decisões e jornada

Tarefas, calendário, decisões, fases e bloqueios. Gate: relações e filtros.

## Fase 6 — Dashboard e orçamento

Agregados, cards, alertas, gráficos e ações rápidas. Gate: banco real, zero hardcode e performance.

## Fase 7 — Notion

Validação, import, mapping, push, webhook, reconcile, conflitos e status. Gate: idempotência, app→Notion, Notion→app e conflito controlado.

## Fase 8 — PWA, offline e polish

Manifest, install, offline seguro, loading, errors, empty, motion e acessibilidade.

## Fase 9 — QA e deploy

E2E, visual, performance, segurança, deploy, README e QA final.

---

# 41. CRITÉRIOS DE ACEITE GLOBAIS

O sistema só está pronto quando:

- autentica;
- persiste após refresh;
- dashboard usa banco;
- filtros funcionam;
- CRUD funciona;
- compras atualizam financeiro;
- entregas atualizam estoque;
- prontidão atualiza indicador;
- tarefas funcionam;
- decisões funcionam;
- jornada separa fases;
- Notion importa;
- sync funciona;
- conflito funciona;
- mobile funciona;
- PWA instala;
- sem overflow;
- sem botões falsos;
- sem segredo no cliente;
- lint, typecheck, testes e build passam;
- QA visual passa;
- README permite instalação por outra pessoa.

---

# 42. CHECKLIST DE QA VISUAL

## Global

- [ ] Paleta correta
- [ ] Tipografia correta
- [ ] Sem cores padrão do framework
- [ ] Sem componentes crus
- [ ] Contraste
- [ ] Espaçamento
- [ ] Alinhamento
- [ ] Hierarquia
- [ ] Ícones consistentes
- [ ] Foco
- [ ] Hover
- [ ] Loading
- [ ] Vazio
- [ ] Erro
- [ ] Mobile
- [ ] Tablet
- [ ] Desktop

## Mobile

- [ ] 390 px sem overflow
- [ ] bottom navigation
- [ ] filtros acessíveis
- [ ] salvar acima do teclado
- [ ] drawer em tela cheia
- [ ] toque de 44 px
- [ ] textos não cortados
- [ ] números legíveis
- [ ] FAB não cobre conteúdo

---

# 43. PROIBIÇÕES DE IMPLEMENTAÇÃO

O Codex não deve:

- criar página única com seções escondidas;
- simular rotas com `display:none`;
- usar localStorage como banco final;
- entregar formulário sem persistência;
- hardcodar dashboard;
- usar mocks em produção;
- copiar o layout anterior;
- espremer tabela desktop no celular;
- usar modal maior que a tela;
- usar `alert()` como notificação;
- renderizar 131 cards sem estratégia;
- misturar Notion no client;
- criar sync sem log;
- usar último write silencioso;
- omitir testes;
- omitir loading ou erro;
- chamar protótipo de produção.

---

# 44. DEFINITION OF DONE POR FEATURE

Uma feature está concluída quando possui:

1. requisito;
2. persistência;
3. permissão;
4. validação;
5. loading;
6. vazio;
7. erro;
8. sucesso;
9. responsividade;
10. acessibilidade;
11. teste unitário aplicável;
12. integração;
13. E2E crítico;
14. QA visual;
15. documentação;
16. zero pendências P0/P1/P2.

---

# 45. PRIMEIRA RESPOSTA ESPERADA DO CODEX

1. diagnóstico do repositório;
2. arquitetura alinhada;
3. árvore inicial;
4. fases;
5. riscos;
6. variáveis;
7. início da Fase 0.

Não devolver apenas plano conceitual. Iniciar arquivos e execução.

---

# 46. PROMPT CURTO PARA INICIAR NO CODEX

> Leia integralmente o `SDD_Ninho_Cael.md`. Implemente o produto descrito, seguindo as fases e gates de qualidade. Não crie protótipo estático, HTML monolítico, botões falsos ou números hardcoded. Todas as ações visíveis devem funcionar e persistir. Comece inspecionando o repositório, crie `IMPLEMENTATION_PLAN.md`, `DECISIONS.md` e `QA_REPORT.md`, e execute a Fase 0 imediatamente. Trabalhe até concluir o máximo possível, rodando lint, typecheck, testes, build e verificação responsiva a cada gate. Quando uma credencial bloquear uma integração, implemente toda a camada, crie `.env.example`, testes com mocks explícitos e documente exatamente o que falta, sem fingir que a integração está ativa.

---

# 47. REFERÊNCIAS INTERNAS

- Ninho do Cael no Notion;
- seis bases estruturadas;
- auditoria dos 123 registros legados;
- 131 necessidades;
- histórico de compras;
- quarto Montessori;
- paleta creme, areia, verde-sálvia, verde-musgo, madeira e palhinha;
- experiência principal em celular.

---

# 48. CONCLUSÃO

O objetivo não é gerar uma interface que “pareça um app”.

O objetivo é entregar um sistema que funcione, seja confiável, preserve dados, tenha rastreabilidade, seja confortável no celular, reflita o quarto do Cael, ajude Alisson e Duda e continue útil após o nascimento.

A aparência deve ser delicada.

A implementação não.
