/**
 * registration/presence.js
 *
 * RF10 — gerenciar lista de participantes. No dia do evento, o admin abre a
 * lista de inscritos do concurso e marca quem compareceu (campo
 * `presencaConfirmada` do model). Inscrição cancelada não recebe presença.
 *
 * Protegida por isLoggedIn + isAdmin.
 */

module.exports = {

  friendlyName: 'Marcar presença',

  description: 'Marca ou desmarca a presença de um inscrito no concurso (somente admin).',

  inputs: {
    id: {
      type: 'number',
      required: true
    },
    presencaConfirmada: {
      type: 'boolean',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Presença atualizada.'
    },
    notFound: {
      statusCode: 404,
      description: 'Inscrição não encontrada.'
    },
    inscricaoCancelada: {
      statusCode: 409,
      description: 'Inscrição cancelada.'
    }
  },

  fn: async function (inputs, exits) {
    var inscricao = await InscricaoConcurso.findOne({ id: inputs.id });
    if (!inscricao) {
      return exits.notFound({ error: 'Inscrição não encontrada.' });
    }

    if (inscricao.status === 'cancelado') {
      return exits.inscricaoCancelada({ error: 'Esta inscrição foi cancelada.' });
    }

    var atualizada = await InscricaoConcurso
      .updateOne({ id: inputs.id })
      .set({ presencaConfirmada: inputs.presencaConfirmada });

    return exits.success(atualizada);
  }

};
