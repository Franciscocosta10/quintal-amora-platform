/**
 * RF11 / RF12 — avisos e chamadas de concurso. Só administradores criam
 * (policy isAdmin).
 *
 * `evento`, `concurso` e `atividade` são opcionais e ligam o aviso ao
 * contexto (ex.: uma chamada leva direto ao concurso).
 */

module.exports = {

  attributes: {

    titulo: {
      type: 'string',
      required: true
    },

    mensagem: {
      type: 'string',
      columnType: 'text',
      required: true
    },

    tipo: {
      type: 'string',
      isIn: ['aviso_geral', 'chamada_concurso', 'alteracao_programacao'],
      defaultsTo: 'aviso_geral'
    },

    autor: {
      model: 'usuario',
      required: true
    },

    // Associações singulares já aceitam null por padrão quando `required`
    // não é informado (Waterline não permite combinar `allowNull` com
    // atributos de associação — dá erro no lift).
    evento: {
      model: 'evento'
    },

    concurso: {
      model: 'concurso'
    },

    atividade: {
      model: 'atividade'
    }

  }

};
