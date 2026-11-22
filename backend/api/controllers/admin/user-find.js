/**
 * RF17 — lista todos os usuários para a tela "Usuários" do painel.
 * Só campos não sensíveis (RNF06): nunca senha nem token de recuperação.
 * Protegida por isLoggedIn + isAdmin (RNF07).
 */

module.exports = {

  friendlyName: 'Listar usuários',

  description: 'Lista os usuários cadastrados (somente admin).',

  inputs: {},

  exits: {
    success: {
      description: 'Lista de usuários.'
    }
  },

  fn: async function () {
    return await Usuario
      .find({ select: ['nomeCompleto', 'email', 'perfil', 'ativo', 'createdAt'] })
      .sort('nomeCompleto ASC');
  }

};
