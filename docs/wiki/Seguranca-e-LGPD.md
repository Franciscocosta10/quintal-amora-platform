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

- **Senhas** viram hash **bcrypt** (custo 10) nos hooks `beforeCreate` e `beforeUpdate` de `models/Usuario.js`, e nunca saem nas respostas. As respostas usam uma **allowlist**: `api/utils/usuarioPublico.js` lista os únicos campos que podem sair (`id`, `nomeCompleto`, `email`, `perfil`, `fotoPerfil`, `ativo`, `createdAt`, `updatedAt`), usada pelo `customToJSON` do model e pelas rotas que devolvem o próprio usuário (login, cadastro, `/auth/me`, perfil e foto). Um campo novo no model fica fora das respostas até ser liberado de propósito.
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

## Vulnerabilidades em dependências (risco conhecido)

O painel de vulnerabilidades do New Relic e o `npm audit --omit=dev` apontam alertas em dependências de produção do backend: 2 críticos e 6 altos no `npm audit`, em novembro de 2026. Os alertas estão em bibliotecas de terceiros, não no código do projeto, e cada um foi analisado:

| Pacote | Origem | Vulnerabilidade | Por que não afeta o projeto hoje |
|---|---|---|---|
| `proxy-addr` (crítico) | `sails-hook-sockets` | Falsificação de IP quando o proxy confiável é configurado por sub-rede | O `trustProxy` não está ativado e o projeto não usa WebSocket |
| `engine.io` | `sails-hook-sockets` | Negação de serviço (DoS) no protocolo do WebSocket | O frontend não abre conexão por socket. Os avisos chegam por polling (a cada 20 s) |
| `body-parser`, `compression`, `sails` | Sails 1 | Negação de serviço em configurações ou situações específicas | O limite de tamanho das requisições segue o padrão. O risco é de indisponibilidade, sem vazamento de dados |
| `nodemailer` 9 | dependência direta | Acesso indevido a arquivo ou URL ao montar anexos | O único e-mail enviado (recuperação de senha) tem conteúdo fixo, sem anexos |
| `brace-expansion` | ferramentas internas das dependências | Negação de serviço com padrão de texto muito grande | Não recebe entrada do usuário |

**Decisão:** o risco foi aceito para a versão 1.0.0. Para a maioria desses alertas, a única correção oferecida pelo `npm audit` é voltar para o Sails 0.12, uma versão antiga e sem suporte. O `npm audit fix` também trocaria versões internas do Waterline (o ORM), o que poderia quebrar o acesso ao banco perto da entrega.

**Próximos passos:**
1. Atualizar o `nodemailer` para a versão 10 e testar de novo o envio da recuperação de senha.
2. Desativar o hook de sockets do Sails, que não é usado. Isso remove as dependências `proxy-addr` e `engine.io`.
3. Atualizar o Sails quando sair uma versão 1.x com as dependências corrigidas.

## LGPD

- **Política de Privacidade:** página pública em `/privacidade` (`frontend/src/pages/auth/PoliticaPrivacidade.jsx`), com dados coletados, finalidade, base legal, compartilhamento (Azure, Gmail, New Relic), armazenamento no navegador, retenção, direitos do titular (art. 18) e o contato para pedir acesso, correção ou exclusão. A tela de cadastro informa e leva até ela no momento da coleta.
- **Dados coletados:** apenas nome, e-mail, senha (em hash) e, opcionalmente, foto de perfil. Não são coletados CPF, telefone, endereço ou dados de pagamento.
- **Finalidade:** identificar o participante no evento (check-in e inscrições) e permitir a recuperação de senha.
- **Minimização:** o painel admin e as listas de inscritos mostram só nome e e-mail. Rotas que listam usuários usam `select` com campos não sensíveis.
- **Desativação:** o administrador pode desativar uma conta, que perde o acesso imediatamente.
- **Monitoramento:** o New Relic está configurado para não enviar token, cookies nem parâmetros das requisições (`backend/newrelic.js`).

## Licenças

- O projeto é distribuído sob a **licença MIT** (`LICENSE` na raiz). As imagens da marca do evento pertencem à organização e são usadas com autorização, fora da licença MIT.
- Todas as dependências de produção usam licenças permissivas, compatíveis com a MIT: MIT (React, React Router, Sails, jsonwebtoken), BSD (bcryptjs, dotenv), Apache-2.0 (newrelic, html5-qrcode), ISC (lucide-react) e MIT-0 (nodemailer).

## Acessibilidade (WCAG 2.1)

- **Contraste (nível AA, 4,5:1 para texto):** o rosa principal (`--accent`) é `#c2185b` (5,9:1 sobre o branco) e os botões das telas de acesso usam `amora-600` (5,1:1). Placeholders e o selo "Atrasada" também atingem o mínimo.
- **Semântica e leitores de tela:** idioma `pt-BR` na página, texto alternativo nas imagens, rótulos em todos os campos e `aria-label` nos botões de ícone (fechar, sino, mostrar senha).
- **Teclado e toque:** contorno visível no foco (`focus-visible`) e áreas de toque de pelo menos 44px no celular.
- **Movimento:** o carrossel respeita a preferência de reduzir animações (`prefers-reduced-motion`).
