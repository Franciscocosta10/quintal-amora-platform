/**
 * Qualquer pessoa com conta no sistema (RF01–RF03). O `perfil` separa
 * visitante de administrador e é usado pela policy isAdmin (RNF07).
 *
 * A senha nunca sai nas respostas: o `customToJSON` usa a allowlist de
 * api/utils/usuarioPublico.js.
 */

var bcrypt = require('bcryptjs');
var usuarioPublico = require('../utils/usuarioPublico');

module.exports = {

  attributes: {

    nomeCompleto: {
      type: 'string',
      required: true,
      maxLength: 120
    },

    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200,
      columnType: 'citext' // opcional: torna a busca por e-mail case-insensitive no Postgres
    },

    senha: {
      type: 'string',
      required: true,
      protect: true // impede que o Waterline inclua a senha em populate() de outros modelos
    },

    perfil: {
      type: 'string',
      isIn: ['visitante', 'administrador'],
      defaultsTo: 'visitante'
    },

    fotoPerfil: {
      type: 'string',
      allowNull: true
    },

    ativo: {
      type: 'boolean',
      defaultsTo: true
    },

    resetPasswordToken: {
      type: 'string',
      allowNull: true,
    },

    resetPasswordExpiresAt: {
      type: 'number',
      allowNull: true,
    },

    // Associações
    inscricoes: {
      collection: 'inscricaoconcurso',
      via: 'usuario'
    },

    checkins: {
      collection: 'checkin',
      via: 'usuario'
    },

    notificacoesEnviadas: {
      collection: 'notificacao',
      via: 'autor'
    }

  },

  // Só os campos públicos saem em um `.toJSON()` (allowlist em
  // api/utils/usuarioPublico.js): senha e dados internos nunca vazam.
  customToJSON: function () {
    return usuarioPublico.apenasCamposPublicos(this);
  },

  // Faz o hash da senha antes de gravar um novo usuário
  beforeCreate: function (usuario, proceed) {
    if (!usuario.senha) {
      return proceed(new Error('Senha é obrigatória.'));
    }
    bcrypt.hash(usuario.senha, 10, (err, hash) => {
      if (err) { return proceed(err); }
      usuario.senha = hash;
      return proceed();
    });
  },

  // Faz o hash de novo quando a senha muda (ex.: redefinição de senha)
  beforeUpdate: function (valuesToUpdate, proceed) {
    if (!valuesToUpdate.senha) {
      return proceed();
    }
    bcrypt.hash(valuesToUpdate.senha, 10, (err, hash) => {
      if (err) { return proceed(err); }
      valuesToUpdate.senha = hash;
      return proceed();
    });
  }

};
