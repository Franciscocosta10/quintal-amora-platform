/**
 * RF15 — exclusão de loja/artista pelo administrador. O nome `destroy`
 * coincide com a action de blueprint do Sails, então a rota automática
 * DELETE /expositor/:id também cai aqui, com a mesma policy de admin.
 */

module.exports = {

  friendlyName: 'Destroy expositor',

  description: 'Remove uma loja ou artista do catálogo (somente admin).',

  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Expositor removido com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function (inputs) {

    var expositorExistente = await Expositor.findOne({ id: inputs.id });
    if (!expositorExistente) {
      throw 'notFound';
    }

    await Expositor.destroyOne({ id: inputs.id });

    return { id: inputs.id };

  }

};
