/**
 * contest/delete.js
 *
 * Remove um concurso (somente admin). As inscrições relacionadas são
 * removidas em cascata pelo `cascadeOnDestroy: true` já configurado
 * globalmente em config/models.js.
 */
module.exports = {

  friendlyName: 'Delete contest',

  description: 'Remove um concurso (somente admin).',

  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Concurso removido com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function (inputs) {

    var concursoExistente = await Concurso.findOne({ id: inputs.id });
    if (!concursoExistente) {
      throw 'notFound';
    }

    await Concurso.destroyOne({ id: inputs.id });

    return { id: inputs.id };

  }

};