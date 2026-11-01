/**
 * contest/find.js
 *
 * RF08 (parte pública) — lista os concursos disponíveis para o visitante
 * acompanhar datas e se inscrever. Espelha activity/find.js.
 */
module.exports = {

  friendlyName: 'Find contests',

  description: 'Lista os concursos do evento, com filtros opcionais.',

  inputs: {

    eventoId: {
      type: 'number',
      description: 'Filtra concursos de um evento específico.'
    },

    status: {
      type: 'string',
      isIn: ['aberto', 'encerrado', 'cancelado'],
      description: 'Filtra por status do concurso.'
    },

    categoria: {
      type: 'string',
      description: 'Filtra por categoria (ex: "torneio", "desfile", "cosplay").'
    }

  },

  exits: {
    success: {
      description: 'Lista de concursos retornada com sucesso.'
    }
  },

  fn: async function (inputs) {

    var query = {};

    if (inputs.eventoId) {
      query.evento = inputs.eventoId;
    }

    if (inputs.status) {
      query.status = inputs.status;
    }

    if (inputs.categoria) {
      query.categoria = inputs.categoria;
    }

    var concursos = await Concurso
      .find(query)
      .sort('dataHoraInicio ASC');

    return concursos;

  }

};