/**
 * auth/login.js
 *
 * RF02 – O sistema deve permitir login/logout.
 * Retorna sempre a mesma mensagem de erro para "e-mail não existe" e
 * "senha errada" — evita que a API revele quais e-mails têm conta.
 *
 * POST /api/v1/auth/login
 * body: { email, senha }
 */

module.exports = {

  friendlyName: 'Login',

  description: 'Autentica um usuário e retorna um token JWT.',

  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true
    },
    senha: {
      type: 'string',
      required: true
    }
  },

  exits: {
    credenciaisInvalidas: {
      statusCode: 401,
      description: 'E-mail ou senha inválidos.'
    }
  },

  fn: async function (inputs, exits) {
    var bcrypt = require('bcryptjs');
    var emailNormalizado = inputs.email.toLowerCase().trim();

    var usuario = await Usuario.findOne({ email: emailNormalizado });
    if (!usuario || !usuario.ativo) {
      return exits.credenciaisInvalidas({ error: 'E-mail ou senha inválidos.' });
    }

    var senhaConfere = await bcrypt.compare(inputs.senha, usuario.senha);
    if (!senhaConfere) {
      return exits.credenciaisInvalidas({ error: 'E-mail ou senha inválidos.' });
    }

    var token = await sails.helpers.jwt.signToken(usuario.id, usuario.perfil);

    return exits.success({
      usuario: _.omit(usuario, ['senha']),
      token: token
    });
  }

};
