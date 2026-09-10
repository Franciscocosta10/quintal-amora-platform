/**
 * checkin/status.js
 */

module.exports = {

  friendlyName: 'Status do check-in',

  description: 'Verifica se o usuário autenticado já fez check-in em um evento.',

  inputs: {
    eventoId: {
      type: 'number',
      required: true,
    },
  },

  exits: {
    success: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {

    // TODO: ajuste conforme o nome real usado pela sua policy de autenticação.
    const usuarioId = this.req.usuario.id;

    const checkin = await Checkin.findOne({
      usuario: usuarioId,
      evento: inputs.eventoId,
    });

    return exits.success({
      fezCheckin: !!checkin,
      checkin: checkin || null,
    });
  },

};
