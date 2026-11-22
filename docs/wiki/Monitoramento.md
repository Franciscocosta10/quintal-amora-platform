# Monitoramento e Observabilidade

## New Relic (APM)

O agente do New Relic acompanha a API em produção: tempo de resposta de cada rota, taxa de erros, consultas ao banco e rastreamento das requisições (distributed tracing).

- **Onde é ligado:** no início de `backend/app.js`, só quando a variável `NEW_RELIC_LICENSE_KEY` existe. Em desenvolvimento e nos testes, o agente não é carregado.
- **Configuração:** `backend/newrelic.js`.
  - Os logs vão para a saída padrão (`stdout`), visível também no **Log stream** do App Service.
  - Respostas `401` e `403` são marcadas como **esperadas** (login errado e falta de permissão não são falhas do sistema) e não poluem a taxa de erros.
  - **Privacidade:** token (`Authorization`), cookies e parâmetros das requisições **não são enviados** ao New Relic (`attributes.exclude`).
- **Nome do app no painel:** `NEW_RELIC_APP_NAME` (padrão `quintal-amora-backend`).

## Health check

`GET /health` (`backend/api/controllers/health/check.js`) é pública e testa a API e o banco de uma vez:

| Situação | Resposta |
|---|---|
| API e banco funcionando | `200 { "status": "ok", "banco": "ok" }` |
| Banco não responde | `503` |

Ela executa um `SELECT 1` no PostgreSQL. É usada:
- pelo **pipeline de deploy**, que só considera o deploy do backend concluído quando a `/health` responde;
- pelo **monitor de disponibilidade**, que avisa se a aplicação sair do ar.

## Onde ver um erro em produção

1. **New Relic → APM → quintal-amora-backend → Errors:** erros com a rota, a mensagem e o rastreamento.
2. **Azure → App Service `quintal-amora-api` → Log stream:** saída do servidor em tempo real, incluindo os `sails.log.error` da aplicação (por exemplo, falha no envio de e-mail).
3. **GitHub → Actions:** falhas de build, testes ou deploy.
