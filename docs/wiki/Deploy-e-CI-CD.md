# Deploy e CI/CD

O deploy é **automático**: a cada merge na `main`, o GitHub Actions testa, analisa e publica o backend e o frontend na Azure. Não há deploy manual por SSH ou FTP.

## Ambientes

| Ambiente | Onde | Para que serve |
|---|---|---|
| Desenvolvimento | Máquina local (Docker + `npm run dev`) | Desenvolver e testar antes de abrir PR |
| Produção | Azure | Versão estável, usada pelo público e pela organização |

## Hospedagem (Azure, região Brazil South)

| Recurso | Serviço |
|---|---|
| Backend `quintal-amora-api` | App Service Linux, Node 22 LTS, plano B1 |
| Frontend `quintal-amora-web` | App Service no mesmo plano. Comando de inicialização: `pm2 serve /home/site/wwwroot --no-daemon --spa` |
| Banco | Azure Database for PostgreSQL Flexible Server 16, B1ms, com SSL obrigatório |

## Pipeline (`.github/workflows/ci.yml`)

Roda em todo **push** para `main` e `feature/**` e em todo **pull request** para a `main`.

```mermaid
flowchart LR
    push["push / PR"] --> back["Backend<br/>npm ci → lint →<br/>testes + cobertura ≥ 75%"]
    push --> front["Frontend<br/>npm ci → lint →<br/>testes + cobertura ≥ 25% → build"]
    back --> sonar["SonarCloud<br/>análise estática e de segurança<br/>com a cobertura dos dois lados"]
    front --> sonar
    sonar -->|só em push na main| dback["Deploy backend<br/>Azure App Service<br/>+ confere /health"]
    sonar -->|só em push na main| dfront["Deploy frontend<br/>build com VITE_API_URL<br/>+ confere se o site responde"]
```

| Etapa | O que acontece se falhar |
|---|---|
| Lint | O job falha e nada é publicado |
| Testes ou cobertura abaixo da meta | O job falha e nada é publicado |
| Build do frontend | O job falha e nada é publicado |
| SonarCloud | Se a análise não conseguir rodar (erro no scanner ou no token), o job falha e nada é publicado. O resultado do Quality Gate aparece na PR como um check separado, para revisão, mas não bloqueia o deploy (o scanner roda sem `sonar.qualitygate.wait`) |
| Deploy | O job falha e a PR mostra o erro. A versão anterior continua no ar |
| `/health` ou site sem resposta depois do deploy | O job fica vermelho para alguém investigar |

Detalhes:
- Os jobs de deploy têm a condição `github.event_name == 'push' && github.ref == 'refs/heads/main'`. Em branches de feature e em PRs eles aparecem como **skipped**, o que é esperado.
- Um push novo na mesma branch cancela a execução anterior, mas **nunca na `main`**, para não interromper um deploy no meio.
- Os deploys usam os ambientes do GitHub `producao-backend` e `producao-frontend`.

### Como rodar o deploy manualmente (se fosse preciso)

Bastaria trocar o gatilho dos jobs de deploy: incluir `workflow_dispatch:` em `on:` e mudar a condição para `github.event_name == 'workflow_dispatch'`. O deploy passaria a rodar só pelo botão **Run workflow** na aba Actions.

## Como voltar para a versão anterior

1. **Mais seguro:** `git revert` do commit com problema, PR e merge na `main`. O pipeline testa e publica a versão corrigida.
2. **Mais rápido:** na aba **Actions**, abrir a execução da `main` da última versão boa e usar **Re-run jobs** nos jobs de deploy. Ela publica de novo aquele commit.

Mudanças no banco não são desfeitas automaticamente. Por isso o Sails roda com `migrate: 'safe'` em produção.

## Configuração no GitHub

Em **Settings → Secrets and variables → Actions**:

| Nome | Tipo | Para que serve |
|---|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Secret | Credencial de publicação do backend |
| `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND` | Secret | Credencial de publicação do frontend |
| `SONAR_TOKEN` | Secret | Acesso ao SonarCloud |
| `VITE_API_URL` | Variable | Endereço da API, embutido no build do frontend |

## Variáveis de ambiente

No backend, ficam no `.env` local (fora do git) ou em **App Service → Configurações → Variáveis de ambiente** na Azure. São lidas em `backend/config/custom.js`, `config/datastores.js`, `config/security.js`, `app.js` e no helper de e-mail.

| Variável | Obrigatória | Para que serve |
|---|---|---|
| `DATABASE_URL` | sim | Conexão com o PostgreSQL |
| `DATABASE_SSL` | só na Azure | `true` liga o SSL exigido pelo PostgreSQL da Azure |
| `JWT_SECRET` | sim | Assinatura dos tokens de login |
| `FRONTEND_URL` | sim | Endereço do frontend: único site autorizado no CORS e base do link de redefinição de senha |
| `PORT` | não | Porta da API (padrão 1337). Na Azure é definida pela plataforma |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | em produção | Envio do e-mail de recuperação de senha (Gmail) |
| `NEW_RELIC_LICENSE_KEY` | em produção | Liga o monitoramento do New Relic |
| `NEW_RELIC_APP_NAME` | não | Nome do app no painel do New Relic |

O `NODE_ENV=production` não precisa ser cadastrado: a Azure inicia a API com `npm start`, que já o define.

No frontend, a única variável é `VITE_API_URL`, que é embutida no build (não é segredo).

## Atualizar as tabelas do banco em produção

Em produção o Sails não altera o banco (`migrate: 'safe'`). Quando um model muda:

1. Libere o IP do seu computador no firewall do PostgreSQL da Azure.
2. Na pasta `backend`, rode a API em modo de desenvolvimento apontando para o banco da Azure:

```powershell
$env:DATABASE_URL="postgres://USUARIO:SENHA@SERVIDOR.postgres.database.azure.com:5432/quintal_amora"; $env:DATABASE_SSL="true"; $env:NEW_RELIC_ENABLED="false"; npm run dev
```

3. Quando aparecer `Auto-migration complete`, encerre com Ctrl+C.

Na primeira configuração do banco, a extensão `citext` precisa ser liberada em **Parâmetros do servidor → `azure.extensions` → `CITEXT`** e criada com `CREATE EXTENSION IF NOT EXISTS citext;`.
