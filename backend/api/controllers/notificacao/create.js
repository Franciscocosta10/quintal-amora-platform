/**
 * RF11 / RF12 — o administrador envia um aviso aos participantes.
 * O aviso fica no banco, ligado ao evento atual, e o frontend busca os
 * novos periodicamente (notificacao/find).
 */

module.exports = {

  friendlyName: 'Enviar notificação',

  description: 'Cria um aviso para os participantes (somente admin).',

  inputs: {

    titulo: {
      type: 'string',
      required: true,
      maxLength: 120
    },

    mensagem: {
      type: 'string',
      required: true,
      maxLength: 1000
    },

    tipo: {
      type: 'string',
      isIn: ['aviso_geral', 'chamada_concurso', 'alteracao_programacao'],
      defaultsTo: 'aviso_geral'
    }

  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Notificação criada.'
    },
    dadosInvalidos: {
      statusCode: 400,
      description: 'Título ou mensagem vazios.'
    }
  },

  fn: async function (inputs, exits) {

    // `required` aceita texto só com espaços; aqui isso conta como vazio.
    var titulo = inputs.titulo.trim();
    var mensagem = inputs.mensagem.trim();

    if (!titulo || !mensagem) {
      return exits.dadosInvalidos({ message: 'Preencha o título e a mensagem do aviso.' });
    }

    var eventos = await Evento.find().sort('createdAt DESC').limit(1);
    var evento = eventos[0];

    var notificacao = await Notificacao.create({
      titulo: titulo,
      mensagem: mensagem,
      tipo: inputs.tipo,
      autor: this.req.usuario.id,
      evento: evento ? evento.id : null
    }).fetch();

    return exits.success(notificacao);

  }

};
