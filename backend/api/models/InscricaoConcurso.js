/**
 * InscricaoConcurso.js
 *
 * Tabela de junção entre Usuario e Concurso (RF08: confirmação de presença
 * em concursos; RF10: gerenciar lista de participantes).
 *
 * IMPORTANTE: Waterline não tem suporte nativo a chave única composta
 * (usuario + concurso). Na etapa 3 (controller de inscrição), o código
 * deve checar manualmente se já existe uma InscricaoConcurso para o par
 * antes de criar uma nova, para não deixar o mesmo usuário se inscrever
 * duas vezes no mesmo concurso.
 */

module.exports = {

  attributes: {

    // `createdAt` (herdado da config global de models.js) já registra
    // o momento da inscrição — não precisa duplicar em outro campo.

    presencaConfirmada: {
      type: 'boolean',
      defaultsTo: false
    },

    status: {
      type: 'string',
      isIn: ['inscrito', 'confirmado', 'cancelado'],
      defaultsTo: 'inscrito'
    },

    usuario: {
      model: 'usuario',
      required: true
    },

    concurso: {
      model: 'concurso',
      required: true
    }

  }

};
