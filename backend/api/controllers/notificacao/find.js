/**
 * RF11 — últimos avisos. Pública, como a programação.
 *
 * O frontend chama esta rota a cada 20 segundos (polling), por isso ela
 * devolve só os avisos mais recentes e só os campos que a tela usa.
 */

var LIMITE = 20;

module.exports = {

  friendlyName: 'Listar notificações',

  description: 'Retorna os avisos mais recentes, do mais novo para o mais antigo.',

  inputs: {},

  exits: {
    success: {
      description: 'Lista de notificações.'
    }
  },

  fn: async function () {

    var notificacoes = await Notificacao
      .find({ select: ['titulo', 'mensagem', 'tipo', 'createdAt'] })
      .sort('createdAt DESC')
      .limit(LIMITE);

    return notificacoes;

  }

};
