/**
 * jwt/sign-token.js
 *
 * Gera um JWT contendo o id e o perfil do usuário (RNF05: autenticação
 * segura via JWT). O `perfil` vai dentro do token só como conveniência;
 * a policy `isLoggedIn` sempre confere o usuário no banco antes de
 * confiar em qualquer dado, então alterar o perfil no banco também
 * reflete imediatamente, sem esperar o token expirar.
 *
 * Uso: await sails.helpers.jwt.signToken(usuario.id, usuario.perfil)
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
