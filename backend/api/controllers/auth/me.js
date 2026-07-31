/**
 * auth/me.js
 *
 * RF03 – confirma para o frontend qual é o perfil do usuário logado
 * (visitante ou administrador), permitindo decidir se mostra o painel
 * administrativo ou a experiência normal do visitante.
 *
 * GET /api/v1/auth/me
 * Requer header: Authorization: Bearer <token>
 * (protegido pela policy isLoggedIn — ver config/policies.js)
 */

module.exports = {

  friendlyName: 'Me',

  description: 'Retorna os dados do usuário autenticado.',

  fn: async function (inputs, exits) {
    return exits.success(_.omit(this.req.usuario, ['senha']));
  }

};
