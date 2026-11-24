/**
 * Devolve o evento atual (o mais recente cadastrado), usado no banner
 * da Home.
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
