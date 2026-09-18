/**
 * RF06 — "O sistema deve exibir a programação completa do evento".
 *
 * Esta action é pública (sem isLoggedIn/isAdmin) porque qualquer visitante,
 * mesmo sem login, precisa ver a programação — é a mesma tela usada tanto
 * na Home (preview) quanto na tela de Programação completa.
 *
 * Suporta filtros opcionais via query string para reaproveitar a mesma
 * action nos dois lugares:
 *   GET /atividades                         -> tudo, ordenado por horário
 *   GET /atividades?eventoId=1              -> só de um evento específico
 *   GET /atividades?dia=2026-05-10          -> só de um dia (aba do front)
 *   GET /atividades?destaque=true           -> só os marcados como destaque
 *   GET /atividades?limit=3                 -> usado no preview da Home
 */

module.exports = {

  friendlyName: 'Find atividades',

  description: 'Lista as atividades da programação do evento, com filtros opcionais.',

  inputs: {

    eventoId: {
      type: 'number',
      description: 'Filtra atividades de um evento específico.'
    },

    dia: {
      type: 'string',
      description: 'Filtra por dia no formato YYYY-MM-DD (ex: "2026-05-10").'
    },

    destaque: {
      type: 'boolean',
      description: 'Se true, retorna apenas atividades marcadas como destaque.'
    },

    limit: {
      type: 'number',
      description: 'Limita a quantidade de resultados (usado no preview da Home).'
    }

  },

  exits: {
    success: {
      description: 'Lista de atividades retornada com sucesso.'
    }
  },

  fn: async function (inputs) {

    var query = {};

    if (inputs.eventoId) {
      query.evento = inputs.eventoId;
    }

    if (inputs.destaque !== undefined) {
      query.destaque = inputs.destaque;
    }

    // Filtro por dia: como guardamos `dataHoraInicio` em epoch ms, convertemos
    // o dia recebido ("2026-05-10") para o intervalo [00:00:00, 23:59:59]
    // daquele dia e usamos `>=`/`<` no lugar de comparar strings de data.
    if (inputs.dia) {
      var inicioDoDia = new Date(inputs.dia + 'T00:00:00');
      var fimDoDia = new Date(inputs.dia + 'T23:59:59.999');

      if (isNaN(inicioDoDia.getTime())) {
        throw { badRequest: { message: 'Formato de data inválido. Use YYYY-MM-DD.' } };
      }

      query.dataHoraInicio = {
        '>=': inicioDoDia.getTime(),
        '<=': fimDoDia.getTime()
      };
    }

    var atividadesQuery = Atividade.find(query).sort('dataHoraInicio ASC');

    if (inputs.limit) {
      atividadesQuery = atividadesQuery.limit(inputs.limit);
    }

    var atividades = await atividadesQuery;

    return atividades;

  }

};
