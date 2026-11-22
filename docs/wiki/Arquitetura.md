# Arquitetura

A plataforma segue uma arquitetura **cliente-servidor em camadas**:

- um **frontend** React (SPA), que só cuida da interface;
- uma **API REST** em Sails.js, que concentra as regras de negócio e a segurança;
- um banco **PostgreSQL**.

Cada parte é publicada separadamente na Azure.

## C4 — Nível 1: Contexto

```mermaid
flowchart TB
    participante["👤 Participante<br/>Vê a programação, se inscreve em concursos,<br/>faz check-in e recebe avisos"]
    organizacao["👤 Organização (administrador)<br/>Gerencia programação, concursos,<br/>expositores, avisos e usuários"]
    sistema["🟦 Plataforma Quintal da Amora<br/>Aplicação web do evento"]
    email["⬜ Servidor SMTP (Gmail)<br/>Entrega o e-mail de recuperação de senha"]
    newrelic["⬜ New Relic<br/>Monitoramento da API"]

    participante -->|usa pelo navegador / celular| sistema
    organizacao -->|usa pelo navegador| sistema
    sistema -->|envia e-mails via SMTP| email
    sistema -->|envia métricas e erros| newrelic
```

## C4 — Nível 2: Containers

```mermaid
flowchart TB
    usuario["👤 Usuário<br/>Participante ou administrador"]

    subgraph azure["Azure (Brazil South)"]
        web["Frontend Web<br/><i>React 19 + Vite + Tailwind</i><br/>App Service quintal-amora-web<br/>arquivos estáticos servidos pelo pm2"]
        api["API Backend<br/><i>Node.js 22 + Sails.js</i><br/>App Service quintal-amora-api"]
        db[("Banco de Dados<br/><i>PostgreSQL 16</i><br/>Azure Database for PostgreSQL")]
    end

    smtp["⬜ SMTP (Gmail)"]
    nr["⬜ New Relic"]

    usuario -->|HTTPS| web
    web -->|"JSON/HTTPS + JWT no cabeçalho Authorization"| api
    api -->|SQL com SSL| db
    api -->|SMTP| smtp
    api -->|agente APM| nr
```

Os diagramas da RFC (contexto, containers e componentes) continuam válidos como visão original da proposta. A diferença é que a RFC previa um "serviço externo de notificações". Na implementação, os avisos são internos: ficam no banco e o frontend os busca por polling (ver [Decisões Técnicas](Decisoes-Tecnicas)).

## C4 — Nível 3: Componentes da API

```mermaid
flowchart LR
    req["Requisição HTTP"] --> routes["config/routes.js<br/>rota → action"]
    routes --> policies["Policies<br/>isLoggedIn (JWT)<br/>isAdmin (perfil)"]
    policies --> controllers["Controllers (actions)<br/>auth, activity, contest,<br/>registration, checkin, event,<br/>expositor, notificacao, admin, health"]
    controllers --> helpers["Helpers e utils<br/>sign-token, send-password-reset-email,<br/>avisoAutomatico, limiteLogin, expositor"]
    controllers --> models["Models (Waterline ORM)<br/>Usuario, Evento, Atividade, Concurso,<br/>InscricaoConcurso, Checkin, Expositor, Notificacao"]
    models --> db[("PostgreSQL")]
```

| Componente | Pasta | Responsabilidade |
|---|---|---|
| Rotas | `backend/config/routes.js` | Liga cada URL a uma action |
| Policies | `backend/api/policies/` | Autenticação (`isLoggedIn`) e autorização (`isAdmin`) antes da action |
| Controllers | `backend/api/controllers/<módulo>/` | Uma action por arquivo, com entradas validadas e saídas (`exits`) declaradas |
| Helpers | `backend/api/helpers/` | Funções reaproveitáveis do Sails (gerar JWT, enviar e-mail) |
| Utils | `backend/api/utils/` | Regras compartilhadas entre controllers (aviso automático, limite de login) |
| Models | `backend/api/models/` | Entidades e relacionamentos (ver [Modelo de Dados](Modelo-de-Dados)) |
| Configuração | `backend/config/` | Banco, CORS, segurança, ambiente de produção |

## Organização do frontend

```mermaid
flowchart LR
    pages["pages/<br/>uma pasta por tela"] --> components["components/<br/>peças reaproveitáveis"]
    pages --> hooks["hooks/<br/>estado e regras de tela<br/>(useSchedule, useNotificacoes...)"]
    hooks --> services["services/<br/>uma função por chamada à API"]
    services --> api["lib/api.js<br/>cliente HTTP único (URL base,<br/>token JWT, tratamento de erro)"]
    pages --> context["context/AuthContext<br/>usuário logado"]
```

| Pasta | Responsabilidade |
|---|---|
| `src/pages/` | Telas (Home, Programação, Concursos, Catálogo, Check-in, Admin, Login...) |
| `src/components/` | Componentes reaproveitáveis (Layout, Sidebar, Header, modais, formulários, cards) |
| `src/hooks/` | Lógica de estado de cada tela, separada da interface |
| `src/services/` | Chamadas à API, uma função por endpoint |
| `src/lib/api.js` | Único ponto que fala com a API: monta a URL, envia o token e padroniza os erros |
| `src/context/` | Contexto de autenticação (usuário logado, login, logout) |

## Caminho de uma requisição

Exemplo: o participante clica em **Inscrever-se** num concurso.

1. O botão em `components/contest/ContestItem.jsx` avisa a página `pages/contest/Contests.jsx`, que chama `inscreverEmConcurso()` em `services/Registration.js`.
2. `lib/api.js` faz `POST https://<api>/contest/12/register` com o cabeçalho `Authorization: Bearer <token>`.
3. Na API, `config/routes.js` direciona para a action `registration/create`.
4. A policy `isLoggedIn` valida o JWT e carrega o usuário do banco em `req.usuario`.
5. A action `registration/create.js` aplica as regras (aberto, período, duplicidade, vagas) e grava com o model `InscricaoConcurso`.
6. O Waterline gera o `INSERT` parametrizado no PostgreSQL.
7. A resposta JSON volta, a página recarrega as inscrições do usuário (`useMyRegistrations`) e mostra o modal de inscrição confirmada.

Se algo dá errado, a action responde com o código e a mensagem adequados (por exemplo, `400` "Vagas Esgotadas"). `lib/api.js` transforma isso em um `Error` com a mensagem pronta para mostrar.
