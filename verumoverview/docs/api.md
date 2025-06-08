# API VerumOverview

Este documento descreve as rotas disponíveis na API. Todas as respostas são em JSON e as rotas protegidas requerem o header `Authorization: Bearer <token>`.

## Autenticação

### POST `/auth/login`
- **Parâmetros:** `email`, `senha`
- **Resposta:** `{ token: string }`

### POST `/auth/solicitar`
- **Parâmetros:** `email`
- **Resposta:** objeto da solicitação criada

### GET `/auth/solicitacoes`
- **Parâmetros:** nenhum
- **Resposta:** lista de solicitações de acesso

### PUT `/auth/solicitacoes/:id`
- **Parâmetros:** campos da solicitação a atualizar
- **Resposta:** solicitação atualizada

## Rotas Protegidas

### GET `/api/protected`
- **Parâmetros:** nenhum
- **Resposta:** `{ message: 'Access granted' }`

## Usuários

### GET `/api/usuarios`
- **Parâmetros:** nenhum
- **Resposta:** lista de usuários

### POST `/api/usuarios`
- **Parâmetros:** `nome`, `email`, `senha`, `perfil_id`
- **Resposta:** usuário criado

### PUT `/api/usuarios/:id`
- **Parâmetros:** campos do usuário a atualizar
- **Resposta:** usuário atualizado

### DELETE `/api/usuarios/:id`
- **Parâmetros:** nenhum
- **Resposta:** objeto vazio em caso de sucesso

## Perfis de Acesso

### GET `/api/perfis`
- **Parâmetros:** nenhum
- **Resposta:** lista de perfis

### POST `/api/perfis`
- **Parâmetros:** `nome`, `permissoes`
- **Resposta:** perfil criado

### PUT `/api/perfis/:id`
- **Parâmetros:** campos do perfil a atualizar
- **Resposta:** perfil atualizado

### DELETE `/api/perfis/:id`
- **Parâmetros:** nenhum
- **Resposta:** objeto vazio em caso de sucesso

## Projetos

### GET `/api/projects`
- **Parâmetros:** nenhum
- **Resposta:** lista de projetos

### GET `/api/projects/next-code`
- **Parâmetros:** nenhum
- **Resposta:** `{ code: number }`

### GET `/api/projects/:id`
- **Parâmetros:** nenhum
- **Resposta:** projeto correspondente

### GET `/api/projects/:id/atividades`
- **Parâmetros:** nenhum
- **Resposta:** atividades do projeto

### POST `/api/projects`
- **Parâmetros:** `nome` e demais campos opcionais
- **Resposta:** projeto criado

### PUT `/api/projects/:id`
- **Parâmetros:** campos do projeto a atualizar
- **Resposta:** projeto atualizado

### DELETE `/api/projects/:id`
- **Parâmetros:** nenhum
- **Resposta:** objeto vazio em caso de sucesso

## Atividades

### GET `/api/atividades`
- **Parâmetros:** nenhum
- **Resposta:** lista de atividades

### GET `/api/atividades/:id`
- **Parâmetros:** nenhum
- **Resposta:** atividade correspondente

### POST `/api/atividades`
- **Parâmetros:** campos da atividade
- **Resposta:** atividade criada

### PUT `/api/atividades/:id`
- **Parâmetros:** campos da atividade a atualizar
- **Resposta:** atividade atualizada

### DELETE `/api/atividades/:id`
- **Parâmetros:** nenhum
- **Resposta:** objeto vazio em caso de sucesso

## Pessoas

### GET `/api/pessoas`
- **Parâmetros:** nenhum
- **Resposta:** lista de pessoas

### GET `/api/pessoas/:id`
- **Parâmetros:** nenhum
- **Resposta:** pessoa correspondente

### POST `/api/pessoas`
- **Parâmetros:** campos da pessoa
- **Resposta:** pessoa criada

### PUT `/api/pessoas/:id`
- **Parâmetros:** campos da pessoa a atualizar
- **Resposta:** pessoa atualizada

### DELETE `/api/pessoas/:id`
- **Parâmetros:** nenhum
- **Resposta:** objeto vazio em caso de sucesso

## Times

### GET `/api/times`
- **Parâmetros:** nenhum
- **Resposta:** lista de times

### GET `/api/times/:id`
- **Parâmetros:** nenhum
- **Resposta:** time correspondente

### POST `/api/times`
- **Parâmetros:** campos do time
- **Resposta:** time criado

### PUT `/api/times/:id`
- **Parâmetros:** campos do time a atualizar
- **Resposta:** time atualizado

### DELETE `/api/times/:id`
- **Parâmetros:** nenhum
- **Resposta:** objeto vazio em caso de sucesso

## Dashboard

### GET `/api/dashboard/metrics`
- **Parâmetros:** nenhum
- **Resposta:** métricas gerais do sistema

### GET `/api/dashboard/activities`
- **Parâmetros:** nenhum
- **Resposta:** últimas atividades registradas

### GET `/api/dashboard/alerts`
- **Parâmetros:** nenhum
- **Resposta:** lista de alertas próximos

## Audit Logs

### GET `/api/audit-logs`
- **Parâmetros:** filtros opcionais (`usuario`, `de`, `ate`)
- **Resposta:** registros de log

## Logs (para depuração)

### POST `/logs`
- **Parâmetros:** dados de log no corpo da requisição
- **Resposta:** `{ status: 'logged' }`
