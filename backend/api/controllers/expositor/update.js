/**
 * expositor/update.js
 *
 * RF15: edição de loja/artista pelo administrador. Atualização parcial —
 * só os campos enviados mudam. `evento` não é editável: mover um expositor
 * para outra edição é, na prática, um novo cadastro (mesma regra de Concurso).
 */
var regrasExpositor = require('../../utils/expositor');

module.exports = {

  friendlyName: 'Update expositor',

  description: 'Edita uma loja ou artista do catálogo (somente admin).',

  inputs: {

    id: { type: 'number', required: true },

    nome: { type: 'string', maxLength: 120 },

    tipo: { type: 'string', isIn: regrasExpositor.TIPOS },

    descricao: { type: 'string', allowNull: true, maxLength: 2000 },

    localizacaoEstande: { type: 'string', allowNull: true, maxLength: 80 },

    contato: { type: 'string', allowNull: true, maxLength: 120 },

    imagem: { type: 'string', allowNull: true, maxLength: 2048 },

    redesSociais: { type: 'json' }

  },

  exits: {
    success: { description: 'Expositor atualizado com sucesso.' },
    notFound: { responseType: 'notFound' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function (inputs) {

    var id = inputs.id;

    var expositorExistente = await Expositor.findOne({ id: id });
    if (!expositorExistente) {
      throw 'notFound';
    }

    var camposParaAtualizar = regrasExpositor.normalizarCampos(_.omit(inputs, ['id']));

    var expositorAtualizado =
      await Expositor.updateOne({ id: id }).set(camposParaAtualizar);

    return expositorAtualizado;

  }

};
