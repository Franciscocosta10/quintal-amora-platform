# API REST

Base: `https://<api>` em produção ou `http://localhost:1337` localmente. Todas as respostas são JSON.

Rotas protegidas esperam o cabeçalho `Authorization: Bearer <token>`, que é recebido no login. As permissões ficam em `backend/config/policies.js`, que **bloqueia tudo por padrão** (`'*': false`): uma rota nova só funciona depois de liberada explicitamente.

**Legenda:** 🌐 pública · 🔑 usuário logado · 🛡️ administrador

## Autenticação e perfil

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| POST | `/auth/signup` | 🌐 | Cria conta de visitante e devolve o token |
| POST | `/auth/login` | 🌐 | Login. Devolve `{ usuario, token }`. `429` após várias senhas erradas |
| POST | `/auth/logout` | 🌐 | Logout (o token é descartado no frontend) |
| GET | `/auth/me` | 🔑 | Dados do usuário logado |
| POST | `/auth/forgot-password` | 🌐 | Envia o e-mail de redefinição de senha |
| POST | `/auth/reset-password` | 🌐 | Define a nova senha com o token do e-mail |
| PUT | `/auth/change-photo` | 🔑 | Troca a foto de perfil |
| PUT | `/auth/update-profile` | 🔑 | Edita nome e e-mail |

## Evento

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| GET | `/event/actual-find` | 🌐 | Evento atual (data, local), usado na Home |
| PUT | `/event/save` | 🛡️ | Cria ou atualiza os dados do evento |

## Programação

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| GET | `/activity` | 🌐 | Lista as atividades |
| POST | `/activity/create` | 🛡️ | Cria atividade |
| PUT | `/activity/update/:id` | 🛡️ | Edita atividade. Se o horário mudar, gera aviso automático |
| DELETE | `/activity/delete/:id` | 🛡️ | Remove atividade |

## Concursos e inscrições

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| GET | `/contest` | 🌐 | Lista os concursos com total de inscritos |
| POST | `/contest/create` | 🛡️ | Cria concurso |
| PUT | `/contest/update/:id` | 🛡️ | Edita concurso. Se o horário mudar, gera aviso automático |
| DELETE | `/contest/delete/:id` | 🛡️ | Remove concurso |
| POST | `/contest/:concursoId/register` | 🔑 | Inscreve o usuário logado |
| GET | `/contest/:concursoId/registrations` | 🛡️ | Lista de inscritos do concurso |
| GET | `/registration/mine` | 🔑 | Inscrições do usuário logado |
| DELETE | `/registration/:id` | 🔑 | Cancela inscrição (o dono ou um administrador) |
| PUT | `/registration/:id/presence` | 🛡️ | Marca ou desmarca a presença |

## Check-in

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| POST | `/checkin` | 🔑 | Registra o check-in a partir do código do QR |
| GET | `/checkin/status/:eventoId` | 🔑 | Diz se o usuário já fez check-in no evento |
| GET | `/checkin/historico` | 🔑 | Check-ins do usuário |

## Catálogo

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| GET | `/expositor` | 🌐 | Lista lojas e artistas |
| GET | `/expositor/:id` | 🌐 | Detalhe de um expositor |
| POST | `/expositor/create` | 🛡️ | Cria expositor |
| PUT | `/expositor/update/:id` | 🛡️ | Edita expositor |
| DELETE | `/expositor/destroy/:id` | 🛡️ | Remove expositor |

## Avisos

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| GET | `/notificacao` | 🌐 | Últimos avisos (consultada pelo frontend a cada 20 s) |
| POST | `/notificacao/create` | 🛡️ | Envia um aviso |

## Administração

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| GET | `/admin/dashboard` | 🛡️ | Totais do evento e usuários recentes |
| GET | `/admin/users` | 🛡️ | Lista e busca usuários |
| POST | `/admin/users` | 🛡️ | Cria usuário (visitante ou administrador) |
| PUT | `/admin/users/:id` | 🛡️ | Altera perfil, ativa ou desativa a conta |

## Monitoramento

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| GET | `/health` | 🌐 | `200 { status: "ok", banco: "ok" }`, ou `503` se o banco não responder |

## Códigos de resposta mais usados

| Código | Quando |
|---|---|
| `200` | Sucesso |
| `400` | Dado inválido ou regra de negócio recusada (ex.: "Vagas Esgotadas") |
| `401` | Sem token, token inválido ou expirado, ou login incorreto |
| `403` | Logado, mas sem permissão (não é administrador) |
| `404` | Registro não encontrado |
| `409` | Conflito (ex.: check-in repetido, e-mail já cadastrado) |
| `429` | Muitas tentativas de login com o mesmo e-mail |
