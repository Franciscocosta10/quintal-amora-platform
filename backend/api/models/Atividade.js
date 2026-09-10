/**
 * Atividade.js
 *
 */

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
      required: true
    },

    dataHoraFim: {
      type: 'number',
      allowNull: true
    },

    // Suporta a "Exceção 1" e afins: cancelamentos/atrasos feitos pelo admin
    // refletem aqui e a tela pública consome esse status.
    status: {
      type: 'string',
      isIn: ['confirmada', 'atrasada', 'cancelada', 'concluida'],
      defaultsTo: 'confirmada'
    },

    evento: {
      model: 'evento',
      required: true
    }

  }

};
