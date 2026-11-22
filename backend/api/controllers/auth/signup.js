/**
 * RF01 — cadastro de usuários. Toda conta nasce como "visitante"; só um
 * admin promove a administrador (RF17, admin/user-update).
 */

var usuarioPublico = require('../../utils/usuarioPublico');

module.exports = {

  friendlyName: 'Signup',

  description: 'Cadastra um novo usuário e retorna um token de sessão.',

  inputs: {
    nomeCompleto: {
      type: 'string',
      required: true,
      maxLength: 120
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true
    },
    senha: {
      type: 'string',
      required: true,
      minLength: 8
    }
  },

  exits: {
    emailJaCadastrado: {
      statusCode: 409,
      description: 'Já existe uma conta com este e-mail.'
    }
  },

  fn: async function (inputs, exits) {
    var emailNormalizado = inputs.email.toLowerCase().trim();

    var existente = await Usuario.findOne({ email: emailNormalizado });
    if (existente) {
      return exits.emailJaCadastrado({ error: 'Este e-mail já está cadastrado.' });
    }

    var usuario = await Usuario.create({
      nomeCompleto: inputs.nomeCompleto.trim(),
      email: emailNormalizado,
      senha: inputs.senha, // o hash acontece no beforeCreate do model Usuario
      perfil: 'visitante'
    }).fetch();

    var token = await sails.helpers.jwt.signToken(usuario.id, usuario.perfil);

    return exits.success({
      usuario: usuarioPublico.apenasCamposPublicos(usuario),
      token: token
    });
  }

};
