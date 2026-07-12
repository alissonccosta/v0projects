# Configurar o Supabase — guia para o Alisson

Este é o único passo do projeto que **precisa ser feito por você**, porque
envolve criar uma conta e gerar chaves secretas que não devem passar pelo chat.
Leva uns 15 minutos. Ao final, o login por e-mail, a família e os convites
passam a funcionar — e eu consigo validar o restante do gate da Fase 2.

> **Regra de ouro:** nunca cole chaves no chat, em commits ou em issues.
> Elas entram apenas em variáveis de ambiente (passo 5).

## 1. Criar o projeto

1. Acesse <https://supabase.com> e crie uma conta (pode usar o GitHub).
2. Clique em **New project**.
3. Escolha:
   - **Name:** `ninho-do-cael`
   - **Database password:** gere uma forte e **guarde no seu gerenciador de
     senhas** (só é usada para acesso direto ao banco).
   - **Region:** `South America (São Paulo)` — menor latência para vocês.
4. Aguarde o projeto provisionar (1–2 minutos).

## 2. Copiar as três chaves

No painel do projeto, abra **Settings → API Keys** (e **Settings → General**
para a URL, se necessário). Você vai copiar três valores:

| No painel do Supabase                        | Variável no app                        | Sensibilidade                                      |
| -------------------------------------------- | -------------------------------------- | -------------------------------------------------- |
| Project URL                                  | `NEXT_PUBLIC_SUPABASE_URL`             | pública                                            |
| Publishable key (`sb_publishable_…`)         | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | pública (RLS protege os dados)                     |
| Secret key (`sb_secret_…`) ou `service_role` | `SUPABASE_SERVICE_ROLE_KEY`            | **SECRETA — somente servidor, nunca no navegador** |

> Se o seu painel mostrar o modelo antigo de chaves (`anon` / `service_role`
> em **Settings → API**), use `anon` como publishable e `service_role` como
> secreta — funciona igual.

## 3. Ativar o login por e-mail (magic link)

1. Em **Authentication → Sign In / Providers**, confirme que **Email** está
   habilitado (é o padrão). Não precisa de senha: usamos apenas o link mágico.
2. Em **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3000` (por enquanto; na Fase 9 trocamos
     pela URL de produção).
   - **Redirect URLs**, adicione:
     - `http://localhost:3000/auth/confirm`
     - (depois do deploy) `https://SEU-DOMINIO/auth/confirm`
3. Opcional: em **Authentication → Emails**, personalize o template do
   "Magic Link" para português.

## 4. Aplicar as migrations (criar as tabelas)

As migrations estão em `ninho-do-cael/supabase/migrations/` (4 arquivos).
Escolha UMA das opções:

**Opção A — SQL Editor (mais simples, sem instalar nada):**

1. No painel, abra **SQL Editor → New query**.
2. Cole o conteúdo de cada arquivo e execute **nesta ordem**:
   1. `20260712090000_enums.sql`
   2. `20260712090100_tabelas.sql`
   3. `20260712090200_rls.sql`
   4. `20260712090300_rpcs.sql`
3. Cada execução deve terminar com "Success".

**Opção B — Supabase CLI (melhor para o longo prazo):**

```bash
cd ninho-do-cael
npx supabase login          # abre o navegador para autorizar
npx supabase link --project-ref SEU_PROJECT_REF   # ref aparece na URL do painel
npx supabase db push        # aplica as migrations pendentes
```

> **Não rode `supabase/seed.sql` no projeto real.** Ele é apenas para banco
> local de desenvolvimento (cria usuários fictícios).

## 5. Onde colocar as chaves

**No seu computador (rodar localmente):**

```bash
cd ninho-do-cael
cp .env.example .env.local
# edite .env.local e preencha as 3 variáveis do passo 2
npm run dev
```

**Para mim (sessões do Claude Code):** as chaves entram como variáveis do
_ambiente_ da sessão — nunca no chat:

1. Abra <https://claude.ai/code>, vá em **Environments** (configurações do
   ambiente usado neste repositório).
2. Em **Environment variables**, adicione as três variáveis do passo 2
   (mesmos nomes).
3. Me avise que adicionou; nas próximas sessões eu as recebo automaticamente
   e rodo o gate completo de autenticação (login, sessão, convite).

**Na Vercel (Fase 9):** mesmas variáveis, em Project → Settings →
Environment Variables. Deixamos documentado em `docs/deployment.md`.

## 6. Primeiro acesso (2 minutos)

1. Rode o app (`npm run dev`) e abra `http://localhost:3000`.
2. Você será levado ao **/login** → digite seu e-mail → **Enviar link de
   acesso** → abra o e-mail e toque no link.
3. Na primeira entrada, o app abre o **onboarding** com os dados do Cael
   pré-preenchidos — confirme e o Ninho é criado (você vira o administrador).
4. Em **Configurações → Família**, crie um convite com o e-mail da Duda e
   envie o link gerado para ela. Ela entra pelo link, faz o mesmo login por
   e-mail e cai direto no aceite do convite.

## Problemas comuns

- **O e-mail não chegou:** confira o spam. O remetente padrão é do Supabase;
  há limite de ~3–4 e-mails/hora no plano gratuito sem SMTP próprio.
- **"O link não pôde ser confirmado":** o link expira em ~1 hora e só vale
  uma vez. Envie um novo.
- **Redirecionou para uma URL estranha / erro de redirect:** confira o
  passo 3 (Site URL e Redirect URLs).
- **Criei o projeto em outra região/nome:** sem problema — o que importa são
  as três variáveis.

## O que eu faço depois disso

Com as variáveis no ambiente, eu executo a validação final da Fase 2 que hoje
fica registrada como pendente no `QA_REPORT.md`: login real de ponta a ponta,
persistência de sessão após refresh, convite aceito pela segunda conta e
verificação de que as rotas protegidas exigem sessão. Aí marco a Fase 2 como
aprovada e sigo para a Fase 3 (Necessidades).
