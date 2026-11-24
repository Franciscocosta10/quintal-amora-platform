/**
 * RF03 — devolve o usuário logado, para o frontend saber o perfil
 * (visitante ou administrador) e decidir se mostra o painel.
 */

var usuarioPublico = require('../../utils/usuarioPublico');

module.exports = {

  friendlyName: 'Me',

  description: 'Retorna os dados do usuário autenticado.',

  fn: async function (inputs, exits) {
    return exits.success(usuarioPublico.apenasCamposPublicos(this.req.usuario));
  }

};
