/**
 * jwt/sign-token.js
 */

module.exports = {

  friendlyName: 'Sign token',

  description: 'Assina um JWT para o usuário autenticado.',

  inputs: {
    usuarioId: {
      type: 'number',
      required: true
    },
    perfil: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      outputType: 'string'
    }
  },

  fn: async function (inputs, exits) {
    var jwt = require('jsonwebtoken');

    var token = jwt.sign(
      { id: inputs.usuarioId, perfil: inputs.perfil },
      sails.config.custom.jwtSecret,
      { expiresIn: sails.config.custom.jwtExpiresIn }
    );

    return exits.success(token);
  }

};
