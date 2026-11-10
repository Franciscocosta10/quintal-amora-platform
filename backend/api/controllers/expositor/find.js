/**
 * expositor/find.js
 *
 * Action pública do catálogo, cobrindo os dois requisitos de leitura:
 *  - RF13 (listagem): GET /expositor           → array, com filtros opcionais
 *  - RF14 (detalhe):  GET /expositor/:id       → um expositor ou 404
 *
 * Uma única action para os dois casos mantém a mesma policy (`true`) e o
 * mesmo formato de resposta de cada expositor, sem duplicar código.
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
