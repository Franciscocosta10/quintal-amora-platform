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

    if (concursos.length === 0) {
      return concursos;
    }

    // Busca as inscrições de todos os concursos numa consulta só (evita
    // N+1) e conta por concurso em memória.
    var idsDosConcursos = concursos.map((concurso) => {
      return concurso.id;
    });

    var inscricoesAtivas = await InscricaoConcurso.find({
      concurso: idsDosConcursos,
      status: { '!=': 'cancelado' }
    });

    var contagemPorConcurso = {};
    inscricoesAtivas.forEach((inscricao) => {
      contagemPorConcurso[inscricao.concurso] =
        (contagemPorConcurso[inscricao.concurso] || 0) + 1;
    });

    var concursosComContagem = concursos.map((concurso) => {
      return _.extend({}, concurso, {
        totalInscritos: contagemPorConcurso[concurso.id] || 0
      });
    });

    return concursosComContagem;

  }

};
