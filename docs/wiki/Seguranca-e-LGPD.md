# Segurança e LGPD

## Autenticação (JWT)

- **Onde o token é gerado:** `backend/api/helpers/jwt/sign-token.js`, chamado no login e no cadastro. O token carrega só o `id` e o `perfil` do usuário e é assinado com `JWT_SECRET` (variável de ambiente).
- **Validade:** 7 dias (`jwtExpiresIn` em `backend/config/custom.js`).
- **Onde é validado:** policy `backend/api/policies/isLoggedIn.js`. Ela confere a assinatura e a validade, e **busca o usuário no banco** a cada requisição. Assim, uma conta desativada perde o acesso na hora, mesmo com token ainda válido.
- **No frontend:** o token fica no `localStorage` e é enviado no cabeçalho `Authorization: Bearer <token>` por `src/lib/api.js`. Como não há cookie de sessão, a API não fica exposta a ataques CSRF. A sessão do Sails fica desligada (`.sailsrc`).

## Autorização

- `backend/config/policies.js` começa com `'*': false`: **tudo é bloqueado por padrão**, e cada rota é liberada de forma explícita.
- Rotas de escrita da organização usam `isLoggedIn` + `isAdmin` (`api/policies/isAdmin.js` confere `perfil === 'administrador'` e responde `403` caso contrário).
- Regras de dono ficam dentro da action. Exemplo: em `registration/cancel.js`, o usuário só cancela a **própria** inscrição, a menos que seja administrador. Em `registration/find-mine.js` e `checkin/historico.js`, a busca é sempre filtrada pelo `req.usuario.id`, então um usuário não vê os dados de outro.
- No frontend, `ProtectedRoute` e `AdminRoute` escondem as telas, mas a proteção real é a da API.

## Senhas e dados sensíveis

- **Senhas** viram hash **bcrypt** (custo 10) nos hooks `beforeCreate` e `beforeUpdate` de `models/Usuario.js`, e nunca saem nas respostas. A lista de campos privados (`senha`, `resetPasswordToken`, `resetPasswordExpiresAt`) fica em um lugar só, `api/utils/usuarioPublico.js`, usado pelo `customToJSON` do model e pelas rotas que devolvem o próprio usuário (login, cadastro, `/auth/me`, perfil e foto).
- **Recuperação de senha:** o token enviado por e-mail é aleatório (32 bytes). No banco fica só o **hash SHA-256**, com validade de 30 minutos, e ele é apagado depois do uso. A resposta é sempre a mesma, exista ou não a conta.
- **Login:** a mensagem de erro é a mesma para "e-mail não existe" e "senha errada". Depois de 10 senhas erradas para o mesmo e-mail, o login fica bloqueado por 15 minutos (`api/utils/limiteLogin.js`).
- **Segredos** (`JWT_SECRET`, `DATABASE_URL`, `SMTP_PASS`, chave do New Relic) ficam em variáveis de ambiente: no `.env` local, que está no `.gitignore`, e nas configurações do App Service em produção. Nenhum segredo está no repositório.

## Proteção contra ataques comuns

| Ameaça | Proteção |
|---|---|
| SQL injection | Todo acesso ao banco passa pelo Waterline, que gera consultas parametrizadas. Não há SQL montado com texto do usuário |
| XSS | O React escapa todo texto exibido. Links de imagem e redes sociais só aceitam `http`/`https` (`api/utils/expositor.js`), o que bloqueia `javascript:` |
| CSRF | Autenticação por token no cabeçalho, sem cookies |
| CORS | Só o endereço do frontend (`FRONTEND_URL`) pode chamar a API (`config/security.js`) |
| Força bruta no login | Bloqueio por e-mail após 10 falhas (`429`) |
| Exposição do framework | Cabeçalho `X-Powered-By` removido (`config/http.js`) |
| Tráfego em texto puro | HTTPS no App Service e SSL obrigatório na conexão com o PostgreSQL da Azure (`DATABASE_SSL=true`) |
| Dado inválido | Cada action declara os tipos das entradas (`inputs`) e valida as regras antes de gravar. O frontend também valida os formulários, mas a validação que vale é a do backend |

## LGPD

- **Dados coletados:** apenas nome, e-mail, senha (em hash) e, opcionalmente, foto de perfil. Não são coletados CPF, telefone, endereço ou dados de pagamento.
- **Finalidade:** identificar o participante no evento (check-in e inscrições) e permitir a recuperação de senha.
- **Minimização:** o painel admin e as listas de inscritos mostram só nome e e-mail. Rotas que listam usuários usam `select` com campos não sensíveis.
- **Desativação:** o administrador pode desativar uma conta, que perde o acesso imediatamente.
- **Monitoramento:** o New Relic está configurado para não enviar token, cookies nem parâmetros das requisições (`backend/newrelic.js`).
