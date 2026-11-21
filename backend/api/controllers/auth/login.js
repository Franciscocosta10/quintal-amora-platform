/**
 * auth/login.js
 *
 * RF02 – O sistema deve permitir login/logout.
 * Retorna sempre a mesma mensagem de erro para "e-mail não existe" e
 * "senha errada" — evita que a API revele quais e-mails têm conta.
 *
 * Depois de várias senhas erradas para o mesmo e-mail, o login desse
 * e-mail fica bloqueado por alguns minutos (utils/limiteLogin.js). E-mails
 * sem conta também contam, senão o bloqueio revelaria quais existem.
 *
 * POST /api/v1/auth/login
 * body: { email, senha }
 */

var limiteLogin = require('../../utils/limiteLogin');

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
    },
    muitasTentativas: {
      statusCode: 429,
      description: 'Senhas erradas demais para este e-mail; aguarde para tentar de novo.'
    }
  },

  fn: async function (inputs, exits) {
    var bcrypt = require('bcryptjs');
    var emailNormalizado = inputs.email.toLowerCase().trim();

    var minutos = limiteLogin.minutosBloqueado(emailNormalizado);
    if (minutos > 0) {
      return exits.muitasTentativas({
        error: 'Muitas tentativas de login com este e-mail. Tente novamente em ' + minutos + (minutos === 1 ? ' minuto.' : ' minutos.')
      });
    }

    var usuario = await Usuario.findOne({ email: emailNormalizado });
    if (!usuario || !usuario.ativo) {
      limiteLogin.registrarFalha(emailNormalizado);
      return exits.credenciaisInvalidas({ error: 'E-mail ou senha inválidos.' });
    }

    var senhaConfere = await bcrypt.compare(inputs.senha, usuario.senha);
    if (!senhaConfere) {
      limiteLogin.registrarFalha(emailNormalizado);
      return exits.credenciaisInvalidas({ error: 'E-mail ou senha inválidos.' });
    }

    limiteLogin.zerar(emailNormalizado);

    var token = await sails.helpers.jwt.signToken(usuario.id, usuario.perfil);

    return exits.success({
      usuario: _.omit(usuario, ['senha']),
      token: token
    });
  }

};
