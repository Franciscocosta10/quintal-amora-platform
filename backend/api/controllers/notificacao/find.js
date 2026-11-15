/**
 * notificacao/find.js
 *
 * RF11 — lista os avisos mais recentes. Pública, como a programação e os
 * concursos: são informações gerais do evento.
 *
 * O frontend chama esta rota a cada poucos segundos (polling) para
 * mostrar avisos novos no sino sem recarregar a página. Por isso devolve
 * só os últimos avisos e só os campos que a tela usa.
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
