/**
 * auth/update-profile.js
 *
 * Atualiza nome e e-mail do usuário logado (tela "Minha conta").
 *
 * PUT /auth/update-profile
 * Body: { "nomeCompleto": "...", "email": "..." }
 * Requer header: Authorization: Bearer <token> (policy isLoggedIn)
 *
 * Senha e perfil ficam de fora de propósito: senha tem fluxo próprio
 * (forgot/reset-password) e perfil só muda por admin.
 */

module.exports = {

  friendlyName: 'Update profile',

  description: 'Atualiza nome e e-mail do usuário autenticado.',

  inputs: {
    nomeCompleto: {
      type: 'string',
      required: true,
      maxLength: 120
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      maxLength: 200
    }
  },

  exits: {
    success: {
      description: 'Dados atualizados.'
    },
    badRequest: {
      statusCode: 400,
      description: 'Dados inválidos.'
    },
    emailJaCadastrado: {
      statusCode: 409,
      description: 'O e-mail já pertence a outra conta.'
    }
  },

  fn: async function (inputs) {
    var idUsuario = this.req.usuario.id;
    var nome = inputs.nomeCompleto.trim();
    var email = inputs.email.toLowerCase().trim();

    if (!nome) {
      throw { badRequest: { message: 'Informe seu nome.' } };
    }

    var donoDoEmail = await Usuario.findOne({ email: email });
    if (donoDoEmail && donoDoEmail.id !== idUsuario) {
      throw { emailJaCadastrado: { message: 'Este e-mail já está sendo usado por outra conta.' } };
    }

    var usuarioAtualizado = await Usuario
      .updateOne({ id: idUsuario })
      .set({ nomeCompleto: nome, email: email });

    return _.omit(usuarioAtualizado, ['senha']);
  }

};
