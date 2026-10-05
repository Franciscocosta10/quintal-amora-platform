/**
 * Altera o perfil do usuário autenticado.
 *
 * Esta action existe apenas para facilitar os testes durante
 * o desenvolvimento do TCC.
 *
 * Não deve ser utilizada em produção.
 */

module.exports = {
  friendlyName: 'Change profile',

  description: 'Altera o perfil do usuário autenticado durante o desenvolvimento.',

  inputs: {
    perfil: {
      type: 'string',
      required: true,
      isIn: ['visitante', 'administrador']
    }
  },

  exits: {
    success: {
      description: 'Perfil alterado com sucesso.'
    },

    forbidden: {
      statusCode: 403,
      description: 'Funcionalidade disponível somente em desenvolvimento.'
    },

    notFound: {
      statusCode: 404,
      description: 'Usuário não encontrado.'
    },

    unauthorized: {
      statusCode: 401,
      description: 'Usuário não autenticado.'
    }
  },

fn: async function (inputs, exits) {
  console.log('USUARIO AUTENTICADO:', this.req.usuario);

  if (sails.config.environment !== 'development') {
    return exits.forbidden({
      error: 'Alteração de perfil disponível somente em ambiente de desenvolvimento.'
    });
  }

  if (!this.req.usuario) {
    return exits.unauthorized({
      error: 'Usuário não autenticado.'
    });
  }

  const usuarioAtualizado = await Usuario.updateOne({
    id: this.req.usuario.id
  }).set({
    perfil: inputs.perfil
  });

  if (!usuarioAtualizado) {
    return exits.notFound({
      error: 'Usuário não encontrado.'
    });
  }

  return exits.success(_.omit(usuarioAtualizado, ['senha']));
}
};