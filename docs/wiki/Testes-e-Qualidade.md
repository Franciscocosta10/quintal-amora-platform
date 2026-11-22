# Testes e Qualidade

## Metas de cobertura

| Parte | Meta (portfólio) | Situação | Ferramentas |
|---|---|---|---|
| Backend | 75% de linhas | **~88%** (205 testes) | Mocha, Chai, Sinon, c8 |
| Frontend | 25% de linhas | **~76%** (337 testes) | Vitest, Testing Library, jsdom |

As metas estão configuradas como **mínimo obrigatório**: `backend/.c8rc.json` (`check-coverage`, `lines: 75`) e `frontend/vite.config.js` (`thresholds: { lines: 25 }`). Se a cobertura cair abaixo da meta, o comando falha, o CI fica vermelho e nada é publicado.

## Como rodar e gerar o relatório

```bash
# backend
cd backend
npm run test:unit        # só os testes
npm run test:coverage    # testes + relatório de cobertura

# frontend
cd frontend
npm test                 # só os testes
npm run test:coverage    # testes + relatório de cobertura
```

O relatório aparece no terminal e também em HTML, em `backend/coverage/index.html` e `frontend/coverage/index.html`. No CI, os relatórios ficam salvos como artefatos (`cobertura-backend` e `cobertura-frontend`) e são enviados ao SonarCloud.

## Como os testes estão organizados

**Backend** (`backend/test/unit/`), espelhando a pasta `api/`:

| Pasta | O que testa |
|---|---|
| `controllers/<módulo>/` | Cada action: caminho feliz, regras de negócio e erros (`404`, `403`, `409`...) |
| `policies/` | `isLoggedIn` (sem token, token inválido, usuário inativo) e `isAdmin` |
| `models/` | Hash da senha e remoção da senha nas respostas |
| `helpers/`, `utils/` | Geração do JWT, envio de e-mail, aviso automático, limite de login, normalização de expositores |

Os testes de backend são unitários: os models do Sails (`Usuario`, `Concurso`...) são substituídos por dublês do Sinon, então não precisam de banco.

**Frontend** (`frontend/src/**/*.test.jsx`), ao lado de cada componente, hook ou serviço. Os testes renderizam as telas com a Testing Library e simulam o que o usuário faz (clicar, digitar), com a API simulada.

## Testes que exercitam regra de negócio

Alguns exemplos de onde a regra está de fato coberta, e não só a linha:

| Regra | Teste |
|---|---|
| Inscrição só no período, sem duplicidade e com vagas | `backend/test/unit/controllers/registration/create.test.js`: "rejeita quando o limite de vagas já foi atingido", "rejeita inscrição duplicada do mesmo usuário", "rejeita quando o período de inscrição já encerrou"... |
| Só o dono ou um administrador cancela uma inscrição | `registration/cancel.test.js`: "rejeita (forbidden) quando não é o dono nem é admin" |
| Check-in uma única vez e só com QR válido | `checkin/create.test.js`: "não registra duas vezes no mesmo evento", "recusa QR que não é de check-in" |
| Bloqueio de login após várias senhas erradas | `utils/limiteLogin.test.js` e `controllers/auth/login.test.js` |
| Aviso automático quando o horário muda | `utils/avisoAutomatico.test.js` |
| Volta para o link do totem depois do login | `frontend/src/pages/auth/VoltarAposLogin.test.jsx` |

**Exemplo prático:** se a regra de vagas em `registration/create.js` for alterada (trocar `>=` por `>` na comparação com `limiteParticipantes`), o teste "rejeita quando o limite de vagas já foi atingido" falha.

## TDD

O ciclo usado nas regras de negócio é **vermelho → verde → refatorar**:

1. Escrever o teste da regra nova, que falha (por exemplo, "rejeita quando o limite de vagas já foi atingido").
2. Implementar o mínimo na action para o teste passar.
3. Refatorar com os testes como rede de segurança (por exemplo, extrair regras para `api/utils/`).

## Qualidade estática

- **ESLint** no backend e no frontend, rodando no CI (`npm run lint`). O CI falha com qualquer erro.
- **SonarCloud** analisa todo push e PR, com a cobertura dos dois lados (`sonar-project.properties`): bugs, vulnerabilidades, code smells, duplicação e security hotspots. O resultado aparece como check na PR.
- **Revisão por pares:** as PRs da `main` passam por revisão de colegas do squad (PAC VIII).
