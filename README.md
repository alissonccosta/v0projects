# v0projects

Este repositório contém o projeto **VerumOverview**, plataforma para gerenciamento de produtos digitais.

A estrutura principal está dentro da pasta `verumoverview` com front-end em React e back-end em Node.js/Express utilizando TypeScript.
Ao executar `docker-compose up` pela primeira vez o script `verumoverview/db-init/init.sql`
é aplicado automaticamente ao PostgreSQL.

Para detalhes sobre a identidade visual e a paleta de cores utilizada no projeto, consulte o arquivo [docs/design.md](verumoverview/docs/design.md).

## Credenciais de Acesso

Após a instalação padrão, o primeiro acesso é realizado com o usuário `admin@example.com` e a senha `password`.
Essas credenciais estão definidas em [`backend/src/controllers/AuthController.ts`](verumoverview/backend/src/controllers/AuthController.ts).

No futuro elas poderão ser configuradas por variáveis de ambiente ou outro mecanismo de configuração.
Enquanto isso, altere manualmente o arquivo caso deseje modificar o usuário ou a senha.
