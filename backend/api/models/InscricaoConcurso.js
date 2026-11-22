/**
 * Inscrição de um usuário em um concurso (RF08, RF10).
 *
 * O Waterline não tem chave única composta (usuario + concurso), então
 * registration/create confere se a inscrição já existe antes de criar.
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
