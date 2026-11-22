/**
 * auth/signup.js
 *
 * RF01 – O sistema deve permitir o cadastro de usuários.
 * Todo novo cadastro nasce com perfil "visitante" (RF03); promover a
 * "administrador" é feito por outro admin na tela "Usuários" do painel
 * (RF17, admin/user-update).
 *
 * POST /api/v1/auth/signup
 * body: { nomeCompleto, email, senha }
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
      usuario: usuarioPublico.semCamposPrivados(usuario),
      token: token
    });
  }

};
