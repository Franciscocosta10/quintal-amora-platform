# Decisões Técnicas

Registro das principais decisões de engenharia, no formato de ADRs (Architecture Decision Records) resumidos. A [RFC](https://github.com/Franciscocosta10/quintal-amora-platform/blob/main/docs/RFC.md) é o documento original assinado pela banca e **não é alterada**. As mudanças feitas durante o desenvolvimento estão registradas aqui.

## Mudanças em relação à RFC

| # | O que a RFC previa | O que foi feito | Por quê |
|---|---|---|---|
| M1 | Frontend no **Netlify** e backend no **Railway** (seção 5.5) | Frontend e backend no **Azure App Service**, banco no **Azure Database for PostgreSQL** | Desde fevereiro de 2026, o Portfólio Directions classifica Netlify, Vercel e Render como 🚫 Não Usar. A Azure dá controle sobre a infraestrutura (plano, região, variáveis, firewall do banco) e mantém tudo na mesma região (Brazil South) |
| M2 | Modelo de documentos **NoSQL** para notificações e logs (seção 5.2) | Notificações em uma tabela do **PostgreSQL**, logs no New Relic | O volume de avisos de um evento é pequeno. Um segundo banco traria custo e complexidade sem ganho. As notificações se relacionam com evento, concurso e atividade, o que encaixa bem no modelo relacional |
| M3 | **Serviço externo de notificações** no diagrama de containers | Avisos internos, consultados pelo frontend a cada 20 s (**polling**) | Sem dependência de serviço pago. Para o volume do evento, 20 s de atraso é aceitável. WebSocket ficou como evolução possível (o Sails já tem suporte) |
| M4 | Monitoramento pelos logs da hospedagem (seção 5.5) | **New Relic** (APM) + rota `/health` | O Playbook exige monitoramento ou observabilidade com ferramenta própria |
| M5 | "Confirmação de presença" em concursos como etapa separada | A inscrição **é** a confirmação. A presença real é marcada pelo administrador no dia | Uma etapa a mais confundiria o participante. A organização precisa mesmo é saber quem compareceu |
| M6 | Remover usuários (RF17) | **Desativar** a conta (campo `ativo`) | Apagar o usuário apagaria o histórico de check-ins e inscrições, que alimenta os totais do evento |

## Decisões de arquitetura e stack

### D1 — Sails.js no backend
**Decisão:** API REST com Sails.js (Node.js).
**Motivo:** estrutura MVC pronta (rotas, policies, controllers, models), ORM Waterline com suporte a PostgreSQL, actions com entradas e saídas declaradas e validação de tipos. É JavaScript dos dois lados, o mesmo do frontend.
**Alternativa descartada:** Express puro, que exigiria montar à mão a estrutura de rotas, validação, ORM e permissões.

### D2 — React + Vite + Tailwind no frontend
**Decisão:** SPA em React, com Vite para build e Tailwind para estilo.
**Motivo:** componentes reaproveitáveis, ecossistema grande, build rápido. Tailwind com os tokens da marca (`@theme` em `index.css`) mantém a identidade visual consistente.
**Alternativa descartada:** páginas renderizadas no servidor (views do Sails), que deixariam a interface menos dinâmica e misturariam frontend e backend.

### D3 — PostgreSQL
**Decisão:** banco relacional PostgreSQL 16.
**Motivo:** os dados são fortemente relacionados (evento → atividades, concursos → inscrições → usuários). Tem o tipo `citext` para e-mail sem diferenciar maiúsculas e é oferecido gerenciado na Azure.
**Alternativa descartada:** SQLite e H2 (proibidos pelo Playbook) e MongoDB (ver M2).

### D4 — JWT sem sessão no servidor
**Decisão:** login com JWT enviado no cabeçalho `Authorization`. O hook de sessão do Sails fica desligado.
**Motivo:** a API não guarda estado de sessão (escala sem sessão compartilhada) e não usa cookies, o que elimina CSRF. A policy busca o usuário no banco a cada requisição, então desativar uma conta corta o acesso na hora.
**Trade-off:** um token não pode ser "revogado" antes de expirar (7 dias) sem uma lista de bloqueio. Isso é compensado pela checagem de `ativo` no banco.

### D5 — Bloqueio por padrão nas permissões
**Decisão:** `config/policies.js` começa com `'*': false`.
**Motivo:** uma rota nova nunca fica aberta por esquecimento. Cada rota é liberada de forma explícita.

### D6 — Limite de tentativas de login por e-mail, em memória
**Decisão:** após 10 senhas erradas para o mesmo e-mail, bloquear por 15 minutos. A contagem fica na memória do servidor.
**Motivo:** a contagem é por e-mail, e não por IP, porque no evento muita gente usa o mesmo Wi-Fi. Um bloqueio por IP travaria todos. Fica em memória porque há uma única instância na Azure.
**Trade-off:** reiniciar o servidor zera as contagens. Com mais de uma instância, seria preciso um armazenamento compartilhado (ex.: Redis).

### D7 — `migrate: 'safe'` em produção
**Decisão:** o Sails nunca altera o banco de produção sozinho.
**Motivo:** um `alter` automático pode apagar colunas e dados. As mudanças de schema são aplicadas de forma controlada (ver [Deploy e CI/CD](Deploy-e-CI-CD)).

### D8 — Favoritos no navegador
**Decisão:** atividades e concursos favoritos ficam no `localStorage`.
**Motivo:** é uma preferência pessoal, sem valor para a organização, e funciona até sem login.
**Trade-off:** os favoritos não acompanham o usuário em outro aparelho.

### D9 — Check-in pelo link do QR
**Decisão:** o QR dos totens guarda um link para `/checkin?qr=...`, e não só o código.
**Motivo:** o participante pode ler com a câmera nativa do celular, sem abrir o site antes. Se não estiver logado, volta para o mesmo link depois do login.

### D10 — CI/CD no GitHub Actions com deploy só na `main`
**Decisão:** lint, testes com cobertura mínima e SonarCloud em todo push e PR. Deploy automático só no merge na `main`.
**Motivo:** nada chega à produção sem passar pelos testes e pela revisão da PR. Não há deploy manual.
