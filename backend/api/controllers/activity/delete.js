/**
 * RF07 — remoção de um item da programação. Protegida por `isAdmin`.
 */

module.exports = {

  friendlyName: 'Remove a atividade',

  description: 'Remove um item da programação do evento (somente admin).',

  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Atividade removida com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function (inputs) {

    var atividadeExistente = await Atividade.findOne({ id: inputs.id });
    if (!atividadeExistente) {
      throw 'notFound';
    }

    await Atividade.destroyOne({ id: inputs.id });

    return { id: inputs.id };

  }

};
