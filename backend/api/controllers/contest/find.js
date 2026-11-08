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

    // Uma única consulta buscando as inscrições de TODOS os concursos da
    // lista de uma vez, em vez de uma consulta de count por concurso
    // (N+1). A contagem por concurso é feita em memória depois.
    var idsDosConcursos = concursos.map(function (concurso) {
      return concurso.id;
    });

    var inscricoesAtivas = await InscricaoConcurso.find({
      concurso: idsDosConcursos,
      status: { '!=': 'cancelado' }
    });

    var contagemPorConcurso = {};
    inscricoesAtivas.forEach(function (inscricao) {
      contagemPorConcurso[inscricao.concurso] =
        (contagemPorConcurso[inscricao.concurso] || 0) + 1;
    });

    var concursosComContagem = concursos.map(function (concurso) {
      return _.extend({}, concurso, {
        totalInscritos: contagemPorConcurso[concurso.id] || 0
      });
    });

    return concursosComContagem;

  }

};