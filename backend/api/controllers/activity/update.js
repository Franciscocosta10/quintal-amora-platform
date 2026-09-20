/**
 * activity/update.js
 *
 * RF07 — edição de um item já existente na programação.
 * Protegida pela policy `isAdmin`.
 */

module.exports = {

  friendlyName: 'Update atividade',

  description: 'Edita um item da programação do evento (somente admin).',

  inputs: {

    id: {
      type: 'number',
      required: true
    },

    titulo: {
      type: 'string',
      maxLength: 120
    },

    descricao: {
      type: 'string',
      allowNull: true
    },

    dataHoraInicio: {
      type: 'number'
    },

    dataHoraFim: {
      type: 'number',
      allowNull: true
    },

    local: {
      type: 'string',
      allowNull: true,
      maxLength: 120
    },

    tipo: {
      type: 'string',
      isIn: ['abertura', 'musica', 'cosplay', 'encontro', 'premiacao', 'encerramento', 'geral']
    },

    destaque: {
      type: 'boolean'
    }

  },

  exits: {
    success: {
      description: 'Atividade atualizada com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    },
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs) {

    var id = inputs.id;
    var camposParaAtualizar = _.omit(inputs, ['id']);

    var atividadeExistente = await Atividade.findOne({ id: id });
    if (!atividadeExistente) {
      throw 'notFound';
    }

    var inicioFinal = camposParaAtualizar.dataHoraInicio !== undefined
      ? camposParaAtualizar.dataHoraInicio
      : atividadeExistente.dataHoraInicio;
    var fimFinal = camposParaAtualizar.dataHoraFim !== undefined
      ? camposParaAtualizar.dataHoraFim
      : atividadeExistente.dataHoraFim;

    if (fimFinal && fimFinal < inicioFinal) {
      throw { badRequest: { message: 'dataHoraFim não pode ser anterior a dataHoraInicio.' } };
    }

    var atividadeAtualizada = await Atividade.updateOne({ id: id }).set(camposParaAtualizar);

    return atividadeAtualizada;

  }

};
