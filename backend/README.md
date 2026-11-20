# Backend — Quintal da Amora

API REST da plataforma, feita com [Sails.js v1](https://sailsjs.com) e PostgreSQL.

## Rodar localmente

Pré-requisitos: Node.js 22.16 ou mais recente e o PostgreSQL do `docker-compose.yml` (na raiz do repositório).

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
| `JWT_SECRET` | sim | Assinatura dos tokens de login |
| `PORT` | não | Porta da API (padrão 1337) |
| `FRONTEND_URL` | sim | Endereço do frontend, usado no link de redefinição de senha |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | não | Envio de e-mail. Sem elas, o link de redefinição aparece só no log |
| `NEW_RELIC_LICENSE_KEY` | só em produção | Liga o monitoramento do New Relic. Sem ela, o agente não é carregado |
| `NEW_RELIC_APP_NAME` | não | Nome do app no painel do New Relic (padrão `quintal-amora-backend`) |

## Monitoramento

- **APM (New Relic):** o agente é carregado em `app.js` apenas quando `NEW_RELIC_LICENSE_KEY` existe. A configuração está em `newrelic.js`. Token, cookies e parâmetros das requisições não são enviados ao New Relic.
- **Health check:** `GET /health` é pública e responde `200` com `{ "status": "ok", "banco": "ok" }` quando a API e o banco estão funcionando, ou `503` quando o banco não responde. É a URL usada pelo monitor de disponibilidade.
