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

No arquivo `.env` defina a variável `VITE_API_URL` apontando para a URL da API, por padrão `http://localhost:4000`.

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

Se você modificou `docker-compose.yml`, execute `docker-compose build` para recriar as imagens com as novas configurações.
Alterações em variáveis de ambiente do front-end, como `VITE_API_URL`, exigem a
recriação do container correspondente com:

```bash
docker-compose up --build
```

### Dependências

Se aplicou o ajuste de volumes para preservar os `node_modules` dentro dos containers, `docker-compose up` instalará tudo durante o build.
Caso esteja utilizando os volumes padrão (`./frontend:/app` e `./backend:/app`), execute `npm install` dentro das pastas `frontend` e `backend` **antes** de subir os serviços. A ausência desses diretórios `node_modules` provoca erros na inicialização do front-end.

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

## Credenciais de Acesso

Após subir o ambiente, autentique-se com o usuário `admin@example.com` e senha `password`.
Essas informações encontram-se em [`backend/src/controllers/AuthController.ts`](backend/src/controllers/AuthController.ts).

Em implementações futuras essa configuração poderá ser movida para variáveis de ambiente ou outro arquivo de configuração.
Por ora, modifique o arquivo indicado caso deseje alterar o login padrão.

## Banco de Dados

Ao subir com Docker Compose o PostgreSQL já será iniciado na porta `5432`. Os dados são persistidos em `db-data/`.
No primeiro `docker-compose up` o arquivo `db-init/init.sql` será executado automaticamente
para criar o esquema inicial do banco.

Você pode acessar via `psql`:

```bash
psql -h localhost -U <usuario> -d <banco>
```

Ou utilizar ferramentas como Adminer ou TablePlus apontando para `localhost:5432`.

## Migrações e Seeds

O script utilizado fica em `db-init/init.sql`. Caso precise recriar o banco manualmente
execute-o via `psql`:

```bash
psql -h localhost -U <usuario> -d <banco> -f db-init/init.sql
```

## Monitoramento de Logs

As ações registradas pelo backend são gravadas na tabela `logs`. Durante o desenvolvimento você também pode acompanhar o arquivo `logs/actions.log` gerado localmente.

