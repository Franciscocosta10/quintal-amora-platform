/**
 * Evento.js
 *
 * Representa uma edição do Quintal da Amora. Modelar como entidade própria
 * (em vez de fixar tudo em variáveis globais) permite que a plataforma
 * sobreviva à 16ª, 17ª... edições sem retrabalho, e é a raiz de onde
 * pendura toda a Programação, Concursos, Check-ins e Expositores.
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
      required: true
    },

    dataHoraFim: {
      type: 'number',
      required: true
    },

    // Usado pela regra de negócio "Exceção 3: Encerramento do Evento":
    // enquanto true, ações interativas (check-in, inscrições, notificações)
    // continuam liberadas; após o horário de término, o sistema pode
    // marcar como false e travar essas ações no backend.
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
