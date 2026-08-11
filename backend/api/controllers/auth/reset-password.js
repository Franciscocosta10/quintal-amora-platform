const crypto = require('crypto');

module.exports = {

  friendlyName: 'Redefinir senha',

  description: 'Redefine a senha do usuário validando o token de recuperação.',

  inputs: {
    token: {
      type: 'string',
      required: true,
      description: 'Token recebido por e-mail.'
    },

    novaSenha: {
      type: 'string',
      required: true,
      minLength: 8,
      description: 'Nova senha escolhida pelo usuário.'
    }
  },

  exits: {
    success: {
      description: 'Senha redefinida com sucesso.'
    },

    tokenInvalido: {
      statusCode: 400,
      description: 'Token inválido, já utilizado ou expirado.'
    }
  },

  fn: async function (inputs, exits) {

    const tokenHash = crypto
      .createHash('sha256')
      .update(inputs.token)
      .digest('hex');

    const usuario = await Usuario.findOne({
      resetPasswordToken: tokenHash
    });

    if (
      !usuario ||
      !usuario.resetPasswordExpiresAt ||
      usuario.resetPasswordExpiresAt < Date.now()
    ) {
      return exits.tokenInvalido();
    }

    await Usuario.updateOne({ id: usuario.id }).set({
      senha: inputs.novaSenha,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null
    });

    sails.log.info(
      `Senha redefinida com sucesso — usuario id=${usuario.id}`
    );

    return exits.success({
      message: 'Senha redefinida com sucesso.'
    });
  }

};