  /**
   * evento/find-atual.js
   *
   * Retorna o evento mais recente cadastrado — usado no cabeçalho da Home
   * (banner "QUINTAL DA AMORA" com data/horário/local, ver mockup).
   *
   * ATENÇÃO — PRECISA DE AJUSTE SEU:
   * Como o model Evento já foi criado antes desta etapa, não sei os nomes
   * exatos dos atributos que você usou (ex: pode ser `nome` ou `titulo`,
   * `local` ou `endereco`, `horarioAbertura`/`horarioFechamento` ou um único
   * campo de horário). Este action só faz `Evento.find()` e devolve o
   * registro mais recente — ele funciona independente dos nomes de campo.
   * Quem precisa saber os nomes certos é o frontend (Home.jsx), então
   * ajuste lá o "eventAtual.nome", "eventAtual.local" etc. conforme os
   * atributos reais do seu model Evento.
   */

  module.exports = {

    friendlyName: 'Find evento atual',

    description: 'Retorna os dados do evento mais recente para exibir no cabeçalho da Home.',

    inputs: {},

    exits: {
      success: {
        description: 'Evento retornado com sucesso (ou null se nenhum evento cadastrado).'
      }
    },

    fn: async function () {

      var eventoAtual = await Evento.find().sort('createdAt DESC').limit(1);

      return eventoAtual[0] || null;

    }

  };
