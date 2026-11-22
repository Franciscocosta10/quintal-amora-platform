/**
 * RF02 — logout. A autenticação é JWT sem sessão no servidor, então o
 * logout de fato acontece no frontend, que descarta o token.
 */

module.exports = {

  friendlyName: 'Logout',

  description: 'Confirma o encerramento de sessão (token deve ser descartado no cliente).',

  fn: async function (inputs, exits) {
    return exits.success({ message: 'Logout realizado. Descarte o token no cliente.' });
  }

};
