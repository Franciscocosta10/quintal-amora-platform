/**
 * Catálogo público: sem `id` lista os expositores (RF13), com `id`
 * devolve um só ou 404 (RF14).
 */

var TIPOS = require('../../utils/expositor').TIPOS;

module.exports = {

  friendlyName: 'Find expositores',

  description: 'Lista os expositores (lojas e artistas) ou retorna um expositor pelo id.',

  inputs: {

    id: {
      type: 'number',
      description: 'Quando informado, retorna apenas este expositor (RF14).'
    },

    eventoId: {
      type: 'number',
      description: 'Filtra expositores de um evento específico.'
    },

    tipo: {
      type: 'string',
      isIn: TIPOS,
      description: 'Filtra por loja ou artista.'
    }

  },

  exits: {
    success: {
      description: 'Expositor(es) retornado(s) com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function (inputs) {

    if (inputs.id) {
      var expositor = await Expositor.findOne({ id: inputs.id });

      if (!expositor) {
        throw 'notFound';
      }

      return expositor;
    }

    var query = {};

    if (inputs.eventoId) {
      query.evento = inputs.eventoId;
    }

    if (inputs.tipo) {
      query.tipo = inputs.tipo;
    }

    // Ordem alfabética: é um catálogo, o visitante procura pelo nome.
    var expositores = await Expositor
      .find(query)
      .sort('nome ASC');

    return expositores;

  }

};
