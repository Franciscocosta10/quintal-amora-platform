/**
 * Atividade.js
 *
 * É a "Programação" do evento (RF06, RF07): apresentações, atrações,
 * encontros com influenciadores etc. Concursos têm seu próprio modelo
 * (Concurso.js) porque carregam regras extras (inscrição, limite de vagas),
 * mas ambos compõem o cronograma visível ao público.
 *
 * Regra de negócio "Restrição de Visibilidade e Edição do Cronograma":
 * leitura é pública; escrita fica restrita a administradores via
 * policy `isAdmin` nas rotas correspondentes do controller (etapa 2).
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
