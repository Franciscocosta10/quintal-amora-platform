module.exports = {

  friendlyName: 'Find contests',

  description: 'Lista os concursos do evento, com filtros opcionais, incluindo o total de inscritos (exclui cancelados).',

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
      isIn: ['torneio', 'desfile', 'cosplay', 'quiz', 'outro'],
      description: 'Filtra por categoria.'
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

    var concursosComContagem = await Promise.all(
      concursos.map(async function (concurso) {
        var totalInscritos = await InscricaoConcurso.count({
          concurso: concurso.id,
          status: { '!=': 'cancelado' }
        });

        return _.extend({}, concurso, { totalInscritos: totalInscritos });
      })
    );

    return concursosComContagem;

  }

};