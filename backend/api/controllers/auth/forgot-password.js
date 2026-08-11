/**
 * auth/forgot-password.js
 *
 * @description :: Inicia o fluxo de recuperação de senha.
 *                  Por segurança, sempre responde com sucesso genérico,
 *                  para não revelar se um e-mail existe na base (user enumeration).
 */

const crypto = require('crypto');

module.exports = {

  friendlyName: 'Esqueci minha senha',

  description: 'Envia um e-mail com link de redefinição de senha, caso o e-mail exista.',

  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'E-mail da conta que deseja redefinir a senha.'
    }
  },

  exits: {
    success: {
      description: 'Solicitação processada (independente de o e-mail existir ou não).'
    }
  },

  fn: async function (inputs, exits) {

    const emailNormalizado = inputs.email.toLowerCase().trim();

    const usuario = await Usuario.findOne({ email: emailNormalizado });

    if (!usuario) {
  sails.log.info(`Solicitação de redefinição para e-mail não cadastrado: ${emailNormalizado}`);

  return exits.success({
    message: 'Recuperação de senha iniciada com sucesso.'
  });
}
    const tokenCru = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenCru).digest('hex');
    const TEMPO_EXPIRACAO_MS = 30 * 60 * 1000; // 30 minutos

    await Usuario.updateOne({ id: usuario.id }).set({
      resetPasswordToken: tokenHash,
      resetPasswordExpiresAt: Date.now() + TEMPO_EXPIRACAO_MS
    });

    const linkRedefinicao = `${sails.config.custom.frontendUrl}/redefinir-senha?token=${tokenCru}`;

    try {
      await sails.helpers.sendPasswordResetEmail.with({
        destinatario: usuario.email,
        nome: usuario.nome, // ajuste pro nome real do atributo, se for diferente
        link: linkRedefinicao
      });
    } catch (err) {
      sails.log.error('Erro ao enviar e-mail de redefinição de senha:', err);
      // não repassa o erro pro cliente, pra não vazar detalhe interno nem
      // dar dica sobre se o e-mail existe ou não
    }

    return exits.success({
  message: 'Recuperação de senha iniciada com sucesso.'
});

  }

};