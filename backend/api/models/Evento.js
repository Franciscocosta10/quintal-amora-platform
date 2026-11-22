/**
 * Uma edição do Quintal da Amora. É a raiz da programação, dos
 * concursos, dos check-ins e dos expositores.
 */

module.exports = {

  attributes: {

    nome: {
      type: 'string',
      required: true
    },

    edicao: {
      type: 'number',
      allowNull: true // ex.: 15 (15ª edição)
    },

    descricao: {
      type: 'string',
      columnType: 'text',
      allowNull: true
    },

    localizacao: {
      type: 'string',
      allowNull: true
    },

    dataHoraInicio: {
      type: 'number', // epoch (ms) — compatível com autoCreatedAt/autoUpdatedAt do projeto
      columnType: 'double precision', // "real" (padrão) perde ~1 min de precisão em epoch ms
      required: true
    },

    dataHoraFim: {
      type: 'number',
      columnType: 'double precision', // "real" (padrão) perde ~1 min de precisão em epoch ms
      required: true
    },

    // Situação do evento, exibida no painel admin. Previsto para a regra
    // "Exceção 3: Encerramento do Evento" da RFC.
    ativo: {
      type: 'boolean',
      defaultsTo: true
    },

    atividades: {
      collection: 'atividade',
      via: 'evento'
    },

    concursos: {
      collection: 'concurso',
      via: 'evento'
    },

    checkins: {
      collection: 'checkin',
      via: 'evento'
    },

    expositores: {
      collection: 'expositor',
      via: 'evento'
    }

  }

};
