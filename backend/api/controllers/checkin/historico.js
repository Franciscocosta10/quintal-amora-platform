/**
 * checkin/historico.js
 *
 * Retorna o histórico de check-ins do usuário autenticado.
 */

module.exports = {

  friendlyName: 'Histórico de check-ins',

  description: 'Retorna o histórico de check-ins do usuário autenticado.',

  exits: {
    success: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {

    const usuarioId = this.req.usuario.id;

    const checkins = await Checkin.find({
      usuario: usuarioId
    })
      .populate('evento')
      .sort('dataHoraEntrada DESC');

    return exits.success({
      checkins
    });
  },

};