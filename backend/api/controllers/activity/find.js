/**
 * RF06 — "O sistema deve exibir a programação completa do evento".
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

    // Filtro por dia utilizando o horário de Brasília (-03:00)
    if (inputs.dia) {

      var inicioDoDia = new Date(
        inputs.dia + 'T00:00:00-03:00'
      );

      var fimDoDia = new Date(
        inputs.dia + 'T23:59:59.999-03:00'
      );

      if (isNaN(inicioDoDia.getTime())) {
        throw {
          badRequest: {
            message: 'Formato de data inválido. Use YYYY-MM-DD.'
          }
        };
      }

      query.dataHoraInicio = {
        '>=': inicioDoDia.getTime(),
        '<=': fimDoDia.getTime()
      };
    }

    var atividadesQuery = Atividade
      .find(query)
      .sort('dataHoraInicio ASC');

    if (inputs.limit !== undefined) {

      if (inputs.limit < 1 || inputs.limit > 100) {
        throw {
          badRequest: {
            message: 'O limite deve estar entre 1 e 100.'
          }
        };
      }

      atividadesQuery = atividadesQuery.limit(inputs.limit);
    }

    var atividades = await atividadesQuery;

    return atividades;
  }

};