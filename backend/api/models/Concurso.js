module.exports = {

  attributes: {

    nome: { type: 'string', required: true },
    categoria: { type: 'string', allowNull: true },
    descricao: { type: 'string', columnType: 'text', allowNull: true },

    dataHoraInicio: {
      type: 'number',
      columnType: 'double precision',
      required: true,
      description: 'Timestamp (epoch ms) de início do concurso.'
    },

    dataHoraFim: {
      type: 'number',
      columnType: 'double precision',
      required: true,
      description: 'Timestamp (epoch ms) de término do concurso (mesmo dia de dataHoraInicio).'
    },

    limiteParticipantes: { type: 'number', allowNull: true },

    inicioInscricao: {
      type: 'number',
      columnType: 'double precision',
      required: true,
      description: 'Início do dia (00:00) em que as inscrições abrem.'
    },

    fimInscricao: {
      type: 'number',
      columnType: 'double precision',
      required: true,
      description: 'Fim do dia (23:59:59) em que as inscrições encerram.'
    },

    status: {
      type: 'string',
      isIn: ['aberto', 'encerrado', 'cancelado'],
      defaultsTo: 'aberto'
    },

    destaque: { type: 'boolean', defaultsTo: false },

    evento: { model: 'evento', required: true },

    inscricoes: { collection: 'inscricaoconcurso', via: 'concurso' }

  }

};