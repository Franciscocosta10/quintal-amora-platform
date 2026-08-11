/**
 * Usuario.js
 *
 * Representa qualquer pessoa com conta no sistema (RF01, RF02, RF03).
 * O campo `perfil` diferencia visitantes de administradores (RF03),
 * usado pela policy `isAdmin` para restringir o painel administrativo (RNF07).
 *
 * A senha nunca é retornada nas respostas da API: além do `customToJSON`
 * abaixo (rede de segurança automática), os controllers de auth também
 * removem o campo manualmente antes de responder.
 */

var bcrypt = require('bcryptjs');

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

    // ---------------------------------------------------------------------
    // Associações (preenchidas conforme os demais módulos forem implementados)
    // ---------------------------------------------------------------------
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

  // Nunca deixa a senha (nem campos internos) vazarem em um `.toJSON()`
  customToJSON: function () {
    return _.omit(this, ['senha']);
  },

  // Faz o hash da senha antes de gravar um novo usuário
  beforeCreate: function (usuario, proceed) {
    if (!usuario.senha) {
      return proceed(new Error('Senha é obrigatória.'));
    }
    bcrypt.hash(usuario.senha, 10, function (err, hash) {
      if (err) { return proceed(err); }
      usuario.senha = hash;
      return proceed();
    });
  },

  // Se algum dia um endpoint de "editar perfil" atualizar a senha,
  // ela é hasheada de novo aqui automaticamente.
  beforeUpdate: function (valuesToUpdate, proceed) {
    if (!valuesToUpdate.senha) {
      return proceed();
    }
    bcrypt.hash(valuesToUpdate.senha, 10, function (err, hash) {
      if (err) { return proceed(err); }
      valuesToUpdate.senha = hash;
      return proceed();
    });
  }

};
