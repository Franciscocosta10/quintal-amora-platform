/**
 * Concurso.js
 *
 * RF08–RF10: cadastro/gerenciamento de concursos, com limite de
 * participantes e janela própria de inscrição — por isso é modelo
 * separado de Atividade, mesmo aparecendo junto no cronograma público.
 *
 * "Sincronização de Concursos" (regra de negócio): inicioInscricao e
 * fimInscricao existem justamente para o controller (etapa 3) poder
 * validar se as inscrições ainda estão abertas antes de aceitar uma
 * InscricaoConcurso.
 */

module.exports = {

  attributes: {

    nome: {
      type: 'string',
      required: true
    },

    categoria: {
      type: 'string',
      allowNull: true
    },

    descricao: {
      type: 'string',
      columnType: 'text',
      allowNull: true
    },

    data: {
      type: 'number', // epoch (ms) do dia do concurso
      required: true
    },

    horario: {
      type: 'string', // texto amigável, ex: "14:00"
      allowNull: true
    },

    limiteParticipantes: {
      type: 'number',
      allowNull: true // null = sem limite
    },

    inicioInscricao: {
      type: 'number',
      required: true
    },

    fimInscricao: {
      type: 'number',
      required: true
    },

    status: {
      type: 'string',
      isIn: ['aberto', 'encerrado', 'cancelado'],
      defaultsTo: 'aberto'
    },

    evento: {
      model: 'evento',
      required: true
    },

    inscricoes: {
      collection: 'inscricaoconcurso',
      via: 'concurso'
    }

  }

};
