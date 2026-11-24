module.exports = {

  attributes: {

    titulo: {
      type: 'string',
      required: true
    },

    descricao: {
      type: 'string',
      columnType: 'text',
      allowNull: true
    },

    tipo: {
      type: 'string',
      isIn: ['atracao', 'apresentacao', 'encontro', 'oficina', 'outro'],
      defaultsTo: 'outro'
    },

    local: {
      type: 'string',
      allowNull: true
    },

    dataHoraInicio: {
      type: 'number',
      columnType: 'double precision', // "real" (padrão) perde ~1 min de precisão em epoch ms
      required: true
    },

    dataHoraFim: {
      type: 'number',
      columnType: 'double precision', // "real" (padrão) perde ~1 min de precisão em epoch ms
      allowNull: true
    },

    // Cancelamentos e atrasos feitos pelo admin aparecem na tela pública
    // por este status.
    status: {
      type: 'string',
      isIn: ['confirmada', 'atrasada', 'cancelada', 'concluida'],
      defaultsTo: 'confirmada'
    },

    destaque: {
      type: 'boolean',
      defaultsTo: false
    },

    evento: {
      model: 'evento',
      required: true
    }

  }

};
