/**
 * registration/find.js
 *
 * RF10 — lista os participantes inscritos em um concurso.
 * Protegida por isAdmin. O populate de `usuario` seleciona só os campos
 * não sensíveis, em linha com RNF06 (proteger dados do usuário).
 */

module.exports = {

  friendlyName: 'Find registrations',

  description: 'Lista as inscrições de um concurso (somente admin).',

  inputs: {

    concursoId: {
      type: 'number',
      required: true
    },

    status: {
      type: 'string',
      isIn: ['inscrito', 'confirmado', 'cancelado']
    }

  },

  exits: {
    success: {
      description: 'Lista de inscrições retornada com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function (inputs) {

    var concursoExiste = await Concurso.findOne({ id: inputs.concursoId });
    if (!concursoExiste) {
      throw 'notFound';
    }

    var query = { concurso: inputs.concursoId };

    if (inputs.status) {
      query.status = inputs.status;
    }

    var inscricoes = await InscricaoConcurso
      .find(query)
      .populate('usuario', { select: ['nomeCompleto', 'email'] })
      .sort('createdAt ASC');

    return inscricoes;

  }

};