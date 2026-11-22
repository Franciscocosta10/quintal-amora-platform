# Frontend — Quintal da Amora

Interface web da plataforma, feita com **React 19**, **Vite**, **Tailwind CSS 4** e **React Router**. É uma SPA que conversa com a [API do backend](../backend/README.md) por REST, com autenticação JWT.

## Rodar localmente

Pré-requisitos: Node.js 22 e a API rodando (ver o [README do backend](../backend/README.md)).

1. Crie o arquivo `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:1337
   ```

2. Instale e rode:

   ```bash
   npm install
   npm run dev
   ```

O site abre em `http://localhost:5173`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarregamento automático |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente a versão gerada pelo build |
| `npm test` | Roda os testes (Vitest + Testing Library) |
| `npm run test:coverage` | Testes com relatório de cobertura (mínimo de 25% de linhas; relatório HTML em `coverage/`) |
| `npm run lint` | ESLint |

## Estrutura

```
src/
├── pages/         uma pasta por tela: Home, Programação (schedule), Concursos (contest),
│                  Catálogo (catalog), Check-in, Admin e autenticação (auth)
├── components/    componentes reaproveitáveis: Layout, Sidebar, Header, sino de
│                  avisos, modais, formulários e cards de cada módulo
├── hooks/         estado e lógica de cada tela (useSchedule, useContests,
│                  useNotificacoes, favoritos...)
├── services/      uma função por chamada à API (Contest.js, Registration.js...)
├── lib/api.js     cliente HTTP único: URL base, token JWT e tratamento de erro
├── context/       contexto de autenticação (usuário logado, login, logout)
├── utils/         funções puras (agrupar por dia, datas, paginação...)
└── test/          configuração dos testes
```

Os testes ficam ao lado do arquivo testado (`Componente.test.jsx`).

## Decisões importantes

- **Um único cliente HTTP** (`src/lib/api.js`): todas as chamadas passam por ele, que adiciona o cabeçalho `Authorization` e transforma erros da API em mensagens prontas para exibir.
- **Rotas protegidas:** `ProtectedRoute` exige login e `AdminRoute` exige perfil de administrador. Quem abre o link do QR do check-in sem estar logado faz login e volta para o mesmo link.
- **Avisos em tempo real por polling:** o hook `useNotificacoes` consulta a API a cada 20 segundos.
- **Identidade visual:** as cores da marca ficam como tokens do Tailwind (`@theme` em `src/index.css`).
- **Responsividade:** layout adaptado para celular e tablet, com áreas de toque de pelo menos 44px e campos com fonte de 16px.

## Deploy

O build é publicado automaticamente no Azure App Service (`quintal-amora-web`) pelo GitHub Actions, a cada merge na `main`. A variável `VITE_API_URL` vem das variables do repositório e é embutida no build. Detalhes na [Wiki](https://github.com/Franciscocosta10/quintal-amora-platform/wiki/Deploy-e-CI-CD).
