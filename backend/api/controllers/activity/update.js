/**
 * activity/update.js
 *
 * RF07 — edição de um item já existente na programação.
 * Protegida pela policy `isAdmin`.
 */

var avisoAutomatico = require('../../utils/avisoAutomatico');

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
      isIn: [
        'atracao',
        'apresentacao',
        'encontro',
        'oficina',
        'outro'
      ]
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

    var atividadeExistente = await Atividade.findOne({
      id: id
    });

    if (!atividadeExistente) {
      throw 'notFound';
    }

    var inicioFinal =
      camposParaAtualizar.dataHoraInicio !== undefined
        ? camposParaAtualizar.dataHoraInicio
        : atividadeExistente.dataHoraInicio;

    var fimFinal =
      camposParaAtualizar.dataHoraFim !== undefined
        ? camposParaAtualizar.dataHoraFim
        : atividadeExistente.dataHoraFim;

    if (fimFinal && fimFinal < inicioFinal) {
      throw {
        badRequest: {
          message:
            'dataHoraFim não pode ser anterior a dataHoraInicio.'
        }
      };
    }

    var atividadeAtualizada =
      await Atividade.updateOne({ id: id })
        .set(camposParaAtualizar);

    // RF09 — se o horário mudou, os participantes recebem um aviso.
    if (avisoAutomatico.mudouHorario(atividadeExistente, camposParaAtualizar)) {
      await avisoAutomatico.avisarMudancaDeHorario({
        tipo: 'alteracao_programacao',
        nome: atividadeAtualizada.titulo,
        inicio: inicioFinal,
        autor: this.req.usuario.id,
        vinculo: { atividade: id, evento: atividadeAtualizada.evento }
      });
    }

    return atividadeAtualizada;
  }

};