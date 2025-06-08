# VerumOverview Local Setup

Este guia descreve como configurar o ambiente de desenvolvimento local da plataforma **VerumOverview**.

## Estrutura de Pastas

- `frontend/` – aplicação React.
- `backend/` – API Node.js com Express.
- `db-data/` – volume para persistência do PostgreSQL usado pelo Docker Compose.

## Variáveis de Ambiente

### Frontend

Copie `.env.example` para `.env` dentro da pasta `frontend` e ajuste se necessário:

```bash
cp frontend/.env.example frontend/.env
```

### Backend

Copie `.env.example` para `.env` dentro da pasta `backend`:

```bash
cp backend/.env.example backend/.env
```

Edite as variáveis conforme sua configuração local.

## Uso com Docker Compose

Para levantar todos os serviços (db, backend e frontend) execute na raiz do projeto:

```bash
docker-compose up
```

A aplicação React estará em `http://localhost:3000` e o backend em `http://localhost:4000`.

Comandos úteis:

- `docker-compose down` – derruba todos os containers.
- `docker-compose logs -f` – acompanha os logs.
- `docker-compose exec <service> sh` – acessa um container.

## Execução Manual (sem Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

O servidor será iniciado na porta definida em `.env` (padrão `4000`).

### Frontend

```bash
cd frontend
npm install
npm start
```

Abrirá a aplicação em `http://localhost:3000`.

## Banco de Dados

Ao subir com Docker Compose o PostgreSQL já será iniciado na porta `5432`. Os dados são persistidos em `db-data/`.

Você pode acessar via `psql`:

```bash
psql -h localhost -U <usuario> -d <banco>
```

Ou utilizar ferramentas como Adminer ou TablePlus apontando para `localhost:5432`.

## Migrações e Seeds

Dentro de `backend/src/db/schema.sql` existe o esquema inicial. Você pode executá-lo manualmente caso precise recriar o banco:

```bash
psql -h localhost -U <usuario> -d <banco> -f backend/src/db/schema.sql
```

## Monitoramento de Logs

As ações registradas pelo backend são gravadas na tabela `logs`. Durante o desenvolvimento você também pode acompanhar o arquivo `logs/actions.log` gerado localmente.

