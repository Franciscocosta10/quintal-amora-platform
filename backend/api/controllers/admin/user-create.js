/**
 * RF17 — "adicionar usuário": o admin cria uma conta para outra pessoa
 * (ex.: alguém da organização que vai ajudar no evento) já com o perfil
 * escolhido. A senha é provisória: o admin repassa e a pessoa pode trocar
 * depois pelo "Esqueci minha senha". O hash acontece no beforeCreate.
 */

module.exports = {

  friendlyName: 'Adicionar usuário',

  description: 'Cria uma conta com o perfil escolhido (somente admin).',

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
    },
    perfil: {
      type: 'string',
      isIn: ['visitante', 'administrador'],
      defaultsTo: 'visitante'
    }
  },

  exits: {
    success: {
      description: 'Usuário criado.'
    },
    dadosInvalidos: {
      statusCode: 400,
      description: 'Nome vazio.'
    },
    emailJaCadastrado: {
      statusCode: 409,
      description: 'Já existe uma conta com este e-mail.'
    }
  },

  fn: async function (inputs, exits) {
    var nomeCompleto = inputs.nomeCompleto.trim();
    if (!nomeCompleto) {
      return exits.dadosInvalidos({ error: 'Informe o nome do usuário.' });
    }

    var email = inputs.email.toLowerCase().trim();
    var existente = await Usuario.findOne({ email: email });
    if (existente) {
      return exits.emailJaCadastrado({ error: 'Este e-mail já está cadastrado.' });
    }

    var usuario = await Usuario.create({
      nomeCompleto: nomeCompleto,
      email: email,
      senha: inputs.senha,
      perfil: inputs.perfil
    }).fetch();

    return exits.success(_.pick(usuario, ['id', 'nomeCompleto', 'email', 'perfil', 'ativo', 'createdAt']));
  }

};
