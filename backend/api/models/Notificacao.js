/**
 * Notificacao.js
 *
 * RF11: notificações sobre eventos e atividades. RF12: alertas de chamada
 * para concursos. Regra de negócio "Permissões de Disparo": só usuários
 * com perfil "administrador" podem criar notificações — reforçado pela
 * policy `isAdmin` na rota de criação (etapa 5, quando o envio for
 * implementado).
 *
 * `evento` / `concurso` / `atividade` são opcionais e servem para o
 * frontend linkar a notificação ao contexto certo (ex.: "chamada" leva
 * direto para a tela do concurso).
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
