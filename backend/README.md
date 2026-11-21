# Backend — Quintal da Amora

API REST da plataforma, feita com [Sails.js v1](https://sailsjs.com) e PostgreSQL.

## Rodar localmente

Pré-requisitos: Node.js 22 (22.16+) ou 24 (24.20+) e o PostgreSQL do `docker-compose.yml` (na raiz do repositório).

> Evite as versões 24.15 a 24.19 e 26.0 a 26.6 do Node: elas têm um bug que derruba o servidor na inicialização quando o agente do New Relic está ligado (`Assertion failed: (next_channel_index_) < (kMaxChannels)`).

```bash
npm install
npm run dev
```

A API sobe em `http://localhost:1337`.

## Testes

```bash
npm run test:unit       # testes unitários (mocha + chai + sinon)
npm run test:coverage   # testes com cobertura (c8), mínimo de 75% de linhas
npm run lint            # ESLint
```

## Variáveis de ambiente

Ficam no arquivo `.env` (local, fora do git) ou nas configurações do servidor (produção).

| Variável | Obrigatória | Para que serve |
|---|---|---|
| `DATABASE_URL` | sim | Conexão com o PostgreSQL |
| `DATABASE_SSL` | só na Azure | `true` liga a conexão criptografada exigida pelo PostgreSQL da Azure. Localmente (Docker) fica sem |
| `JWT_SECRET` | sim | Assinatura dos tokens de login |
| `PORT` | não | Porta da API (padrão 1337). Na Azure é definida pela própria plataforma |
| `FRONTEND_URL` | sim | Endereço do frontend: único site autorizado a chamar a API (CORS) e base do link de redefinição de senha. Aceita mais de um, separados por vírgula |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | só em produção | Envio de e-mail (recuperação de senha). Em dev, sem elas, o link aparece só no log; em produção, sem elas, o envio falha e o erro vai para o log. O Ethereal (`smtp.ethereal.email`) é só para testes: aceita o e-mail mas nunca entrega |
| `NEW_RELIC_LICENSE_KEY` | só em produção | Liga o monitoramento do New Relic. Sem ela, o agente não é carregado |
| `NEW_RELIC_APP_NAME` | não | Nome do app no painel do New Relic (padrão `quintal-amora-backend`) |

### E-mail em produção

Qualquer servidor SMTP real funciona. Duas opções gratuitas:

- **Gmail** (mais simples, sem domínio próprio): ative a verificação em duas etapas na conta, crie uma *senha de app* e use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=<conta>@gmail.com`, `SMTP_PASS=<senha de app>`, `SMTP_FROM="Quintal da Amora" <conta@gmail.com>`. O remetente precisa ser a própria conta.
- **Brevo** (300 e-mails/dia grátis): `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, usuário e chave SMTP do painel. O `SMTP_FROM` precisa ser um remetente verificado lá.

Na Azure, as variáveis vão em **App Service `quintal-amora-api` → Configurações → Variáveis de ambiente**. Confira também se `FRONTEND_URL` aponta para o frontend publicado, porque o link do e-mail usa o primeiro endereço dela. O `NODE_ENV=production` não precisa ser cadastrado: a Azure inicia a API com `npm start`, que já o define.

## Monitoramento

- **APM (New Relic):** o agente é carregado em `app.js` apenas quando `NEW_RELIC_LICENSE_KEY` existe. A configuração está em `newrelic.js`. Token, cookies e parâmetros das requisições não são enviados ao New Relic.
- **Health check:** `GET /health` é pública e responde `200` com `{ "status": "ok", "banco": "ok" }` quando a API e o banco estão funcionando, ou `503` quando o banco não responde. É a URL usada pelo monitor de disponibilidade.

## Deploy (Azure)

O deploy é automático: a cada merge na `main`, o pipeline (`.github/workflows/ci.yml`) roda lint, testes e SonarCloud e, se tudo passar, publica o backend e o frontend no Azure App Service e confere se a `/health` responde.

| Recurso | Serviço |
|---|---|
| Backend (`quintal-amora-api`) | App Service, Linux, Node 22 LTS, plano B1, Brazil South |
| Frontend (`quintal-amora-web`) | App Service no mesmo plano; comando de inicialização `pm2 serve /home/site/wwwroot --no-daemon --spa` |
| Banco | Azure Database for PostgreSQL Flexible Server 16, B1ms, Brazil South |

Configuração no GitHub (Settings → Secrets and variables → Actions):

- Secrets: `AZURE_WEBAPP_PUBLISH_PROFILE` (backend) e `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND` (frontend).
- Variable: `VITE_API_URL` com o endereço do backend, usado no build do frontend.

**Extensão `citext` (uma vez, antes das tabelas):** o e-mail do usuário usa o tipo `citext` (comparação sem diferenciar maiúsculas). Na Azure, a extensão precisa ser liberada em **Parâmetros do servidor → `azure.extensions` → `CITEXT` → Salvar** e depois criada no banco:

```powershell
docker exec -it quintal_amora_db psql "postgres://USUARIO:SENHA@SERVIDOR.postgres.database.azure.com:5432/quintal_amora?sslmode=require" -c "CREATE EXTENSION IF NOT EXISTS citext;"
```

**Tabelas do banco:** em produção o Sails nunca altera o banco (`migrate: 'safe'`), para não perder dados. Quando os models mudam, as tabelas da Azure são atualizadas rodando o backend uma vez, a partir de um computador liberado no firewall do banco, em modo de desenvolvimento e apontando para o banco da Azure (PowerShell, na pasta `backend`):

```powershell
$env:DATABASE_URL="postgres://USUARIO:SENHA@SERVIDOR.postgres.database.azure.com:5432/quintal_amora"; $env:DATABASE_SSL="true"; $env:NEW_RELIC_ENABLED="false"; npm run dev
```

Quando aparecer `Auto-migration complete`, encerre com Ctrl+C.

**Sessões:** o login usa JWT no cabeçalho `Authorization`, então o hook de sessão do Sails fica desligado (`.sailsrc`): a API não cria cookies nem guarda sessões em memória.
