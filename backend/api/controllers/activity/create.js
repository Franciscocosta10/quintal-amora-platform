/**
 * Protegida pela policy `isAdmin` (ver config/policies.js) — só quem tem
 * perfil administrador (RF03) pode cadastrar um item de programação.
 */

module.exports = {

  friendlyName: 'Create atividade',

  description: 'Cadastra um novo item na programação do evento (somente admin).',

  inputs: {

    titulo: {
      type: 'string',
      required: true,
      maxLength: 120
    },

    descricao: {
      type: 'string',
      allowNull: true
    },

    dataHoraInicio: {
      type: 'number',
      required: true,
      description: 'Timestamp (epoch ms) de início da atividade.'
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
      isIn: ['abertura', 'musica', 'cosplay', 'encontro', 'premiacao', 'encerramento', 'geral'],
      defaultsTo: 'geral'
    },

    destaque: {
      type: 'boolean',
      defaultsTo: false
    },

    evento: {
      type: 'number',
      required: true,
      description: 'ID do evento ao qual esta atividade pertence.'
    }

  },

  exits: {
    success: {
      description: 'Atividade criada com sucesso.'
    },
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs) {

    if (inputs.dataHoraFim && inputs.dataHoraFim < inputs.dataHoraInicio) {
      throw { badRequest: { message: 'dataHoraFim não pode ser anterior a dataHoraInicio.' } };
    }

    var eventoExiste = await Evento.findOne({ id: inputs.evento });
    if (!eventoExiste) {
      throw { badRequest: { message: 'Evento informado não existe.' } };
    }

    var novaAtividade = await Atividade.create(inputs).fetch();

    return novaAtividade;

  }

};
