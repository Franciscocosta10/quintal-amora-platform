/**
 * Diz se o usuário logado já fez check-in no evento.
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
