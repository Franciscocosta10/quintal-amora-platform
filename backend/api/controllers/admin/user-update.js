/**
 * admin/user-update.js
 *
 * RF17 — "remover usuário" e troca de perfil.
 *
 * Remover é desativar (`ativo: false`), não apagar: o histórico de
 * check-ins e inscrições continua no banco e a conta pode ser reativada.
 * Conta inativa não entra mais: o login e a policy isLoggedIn recusam.
 *
 * O admin não pode desativar nem rebaixar a própria conta, para o sistema
 * nunca ficar sem nenhum administrador por engano.
 */

module.exports = {

  friendlyName: 'Alterar usuário',

  description: 'Ativa/desativa um usuário ou troca o perfil dele (somente admin).',

  inputs: {
    id: {
      type: 'number',
      required: true
    },
    ativo: {
      type: 'boolean'
    },
    perfil: {
      type: 'string',
      isIn: ['visitante', 'administrador']
    }
  },

  exits: {
    success: {
      description: 'Usuário alterado.'
    },
    dadosInvalidos: {
      statusCode: 400,
      description: 'Nada para alterar ou alteração na própria conta.'
    },
    notFound: {
      statusCode: 404,
      description: 'Usuário não encontrado.'
    }
  },

  fn: async function (inputs, exits) {
    var alteracoes = {};
    if (inputs.ativo !== undefined) { alteracoes.ativo = inputs.ativo; }
    if (inputs.perfil !== undefined) { alteracoes.perfil = inputs.perfil; }

    if (_.isEmpty(alteracoes)) {
      return exits.dadosInvalidos({ error: 'Informe o que deve ser alterado.' });
    }

    if (inputs.id === this.req.usuario.id) {
      return exits.dadosInvalidos({ error: 'Você não pode desativar nem mudar o perfil da sua própria conta.' });
    }

    var usuario = await Usuario.updateOne({ id: inputs.id }).set(alteracoes);
    if (!usuario) {
      return exits.notFound({ error: 'Usuário não encontrado.' });
    }

    return exits.success(_.pick(usuario, ['id', 'nomeCompleto', 'email', 'perfil', 'ativo', 'createdAt']));
  }

};
