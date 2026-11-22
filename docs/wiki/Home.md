# Quintal da Amora — Plataforma do Evento

Plataforma web para organizar o evento **Quintal da Amora** e melhorar a experiência de quem participa: programação, concursos, check-in por QR Code, avisos em tempo real e catálogo de lojas e artistas, tudo em um só lugar.

- **Aplicação no ar:** https://quintal-amora-web-erfrewcwgyc9hcfc.brazilsouth-01.azurewebsites.net/
- **Repositório:** https://github.com/Franciscocosta10/quintal-amora-platform
- **RFC (proposta original, assinada):** [docs/RFC.md](https://github.com/Franciscocosta10/quintal-amora-platform/blob/main/docs/RFC.md)

## O problema

A organização do evento se apoiava em redes sociais, WhatsApp e planilhas. Isso deixava a programação desatualizada, os avisos de última hora se perdiam, a inscrição em concursos era manual e não havia registro de quem realmente compareceu.

## A solução

| Para o participante | Para a organização |
|---|---|
| Ver a programação por dia e favoritar atividades | Cadastrar e editar programação, concursos e expositores |
| Inscrever-se em concursos dentro do prazo e das vagas | Ver a lista de inscritos e marcar presença no dia |
| Fazer check-in lendo o QR Code dos totens | Acompanhar totais do evento no painel admin |
| Receber avisos no sino, sem recarregar a página | Enviar avisos gerais e chamadas de concurso |
| Consultar lojas e artistas participantes | Gerenciar usuários (criar, ativar e desativar, mudar perfil) |

## Páginas desta Wiki

| Página | Conteúdo |
|---|---|
| [Requisitos e Casos de Uso](Requisitos-e-Casos-de-Uso) | Requisitos funcionais, situação de cada um, regras de negócio e casos de uso |
| [Fluxos de Negócio](Fluxos-de-Negocio) | Os fluxos completos, passo a passo, do clique ao banco |
| [Arquitetura](Arquitetura) | Diagramas C4, camadas do backend e do frontend, caminho de uma requisição |
| [Modelo de Dados](Modelo-de-Dados) | Entidades, campos e relacionamentos |
| [API](API) | Rotas da API REST e quem pode acessar cada uma |
| [Segurança e LGPD](Seguranca-e-LGPD) | Autenticação, autorização, proteção de dados |
| [Como Rodar Localmente](Como-Rodar-Localmente) | Passo a passo para rodar o projeto na sua máquina |
| [Deploy e CI/CD](Deploy-e-CI-CD) | Pipeline, hospedagem na Azure, variáveis de ambiente, como voltar uma versão |
| [Testes e Qualidade](Testes-e-Qualidade) | TDD, cobertura, SonarCloud, como gerar os relatórios |
| [Monitoramento](Monitoramento) | New Relic e health check |
| [Decisões Técnicas](Decisoes-Tecnicas) | Por que cada tecnologia, e o que mudou em relação à RFC |

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router |
| Backend | Node.js 22, Sails.js 1 (API REST, MVC) |
| Banco | PostgreSQL 16 |
| Hospedagem | Azure App Service (backend e frontend) e Azure Database for PostgreSQL |
| CI/CD | GitHub Actions |
| Qualidade | ESLint, Mocha/Chai/Sinon, Vitest/Testing Library, SonarCloud |
| Observabilidade | New Relic (APM) e rota `/health` |
