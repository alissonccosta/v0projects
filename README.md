# v0projects

Este repositório contém o projeto **VerumOverview**, plataforma para gerenciamento de produtos digitais.

A estrutura principal está dentro da pasta `verumoverview` com front-end em React e back-end em Node.js/Express utilizando TypeScript.
Ao executar `docker-compose up` pela primeira vez o script `verumoverview/db-init/init.sql`
é aplicado automaticamente ao PostgreSQL.

Para detalhes sobre a identidade visual e a paleta de cores utilizada no projeto, consulte o arquivo [docs/design.md](verumoverview/docs/design.md).

## Acesso ao Sistema

Quem ainda não possui cadastro deve visitar `/solicitar-acesso` e preencher o formulário.
Os administradores analisam essas solicitações na página **Controle de Acesso**.

Logo após a instalação, utilize o usuário `admin@example.com` e a senha `password`
para realizar o primeiro login. Altere esse usuário assim que possível.
