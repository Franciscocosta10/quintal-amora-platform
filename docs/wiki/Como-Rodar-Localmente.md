# Como Rodar Localmente

## Pré-requisitos

- **Node.js 22** (22.16 ou mais nova). Evite as versões 24.15 a 24.19 e 26.0 a 26.6: elas têm um bug que derruba o servidor quando o agente do New Relic está ligado.
- **Docker Desktop**, para o PostgreSQL.
- **Git**.

## 1. Clonar o repositório

```bash
git clone https://github.com/Franciscocosta10/quintal-amora-platform.git
cd quintal-amora-platform
```

## 2. Subir o banco de dados

O `docker-compose.yml` na raiz sobe um PostgreSQL 16 com usuário, senha e banco de desenvolvimento:

```bash
docker compose up -d
```

Na primeira vez, crie a extensão `citext`, usada no e-mail do usuário:

```bash
docker exec -it quintal_amora_db psql -U quintal_admin -d quintal_amora -c "CREATE EXTENSION IF NOT EXISTS citext;"
```

## 3. Configurar e rodar o backend

Crie o arquivo `backend/.env`:

```env
DATABASE_URL=postgres://quintal_admin:dev_password_local@localhost:5432/quintal_amora
JWT_SECRET=qualquer-texto-longo-para-desenvolvimento
FRONTEND_URL=http://localhost:5173
```

As outras variáveis são opcionais em desenvolvimento. Sem as variáveis de SMTP, o link de redefinição de senha aparece no console em vez de ser enviado por e-mail. A lista completa está em [Deploy e CI/CD](Deploy-e-CI-CD#variáveis-de-ambiente).

```bash
cd backend
npm install
npm run dev
```

A API sobe em `http://localhost:1337`. Na primeira execução, o Sails cria as tabelas a partir dos models. Confira se está tudo certo em `http://localhost:1337/health`.

## 4. Configurar e rodar o frontend

Crie o arquivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:1337
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O site abre em `http://localhost:5173`.

## 5. Criar o primeiro administrador

Cadastre-se pela tela **Cadastre-se** e depois promova a conta a administrador direto no banco:

```bash
docker exec -it quintal_amora_db psql -U quintal_admin -d quintal_amora -c "UPDATE usuario SET perfil='administrador' WHERE email='seu@email.com';"
```

Saia e entre de novo. O menu **Painel admin** vai aparecer. A partir dele, outros administradores podem ser criados pela tela de usuários.

## 6. Cadastrar o evento

No **Painel admin → Dados do evento**, cadastre o evento atual. Programação, concursos, expositores e check-in dependem dele.

## Comandos úteis

| Onde | Comando | O que faz |
|---|---|---|
| backend | `npm run dev` | Sobe a API |
| backend | `npm run test:unit` | Roda os testes |
| backend | `npm run test:coverage` | Testes com relatório de cobertura (mínimo 75%) |
| backend | `npm run lint` | ESLint |
| frontend | `npm run dev` | Sobe o site com recarregamento automático |
| frontend | `npm test` | Roda os testes |
| frontend | `npm run test:coverage` | Testes com relatório de cobertura (mínimo 25%) |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run build` | Gera a versão de produção em `dist/` |
