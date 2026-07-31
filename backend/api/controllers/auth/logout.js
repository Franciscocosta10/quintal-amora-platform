/**
 * auth/logout.js
 *
 * RF02 – logout. Como a autenticação é JWT stateless (nenhuma sessão
 * fica guardada no servidor), "fazer logout" é, na prática, o frontend
 * descartar o token guardado (ex.: localStorage). Este endpoint existe
 * para o frontend ter um contrato claro e para permitir, no futuro,
 * evoluir para uma blacklist de tokens sem quebrar o cliente.
 *
 * POST /api/v1/auth/logout
 */

module.exports = {

  friendlyName: 'Logout',

  description: 'Confirma o encerramento de sessão (token deve ser descartado no cliente).',

  fn: async function (inputs, exits) {
    return exits.success({ message: 'Logout realizado. Descarte o token no cliente.' });
  }

};
