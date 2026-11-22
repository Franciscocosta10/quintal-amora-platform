/**
 * RF18 — cadastra ou edita o evento.
 *
 * O sistema trabalha com um evento por vez (o mais recente), então esta
 * action é um "salvar": se ainda não existe evento, cria; se existe,
 * atualiza.
 */

module.exports = {

  friendlyName: 'Salvar evento',

  description: 'Cria o evento (se ainda não existir) ou edita o evento atual (somente admin).',

  inputs: {

    nome: {
      type: 'string',
      required: true,
      maxLength: 120
    },

    edicao: {
      type: 'number',
      allowNull: true
    },

    localizacao: {
      type: 'string',
      allowNull: true,
      maxLength: 200
    },

    dataHoraInicio: {
      type: 'number',
      required: true
    },

    dataHoraFim: {
      type: 'number',
      required: true
    }

  },

  exits: {
    success: {
      description: 'Evento salvo.'
    },
    dadosInvalidos: {
      statusCode: 400,
      description: 'Nome vazio ou datas inválidas.'
    }
  },

  fn: async function (inputs, exits) {

    var nome = inputs.nome.trim();

    if (!nome) {
      return exits.dadosInvalidos({ message: 'Informe o nome do evento.' });
    }

    if (inputs.dataHoraFim <= inputs.dataHoraInicio) {
      return exits.dadosInvalidos({ message: 'O término do evento deve ser depois do início.' });
    }

    var dados = {
      nome: nome,
      edicao: inputs.edicao,
      localizacao: inputs.localizacao,
      dataHoraInicio: inputs.dataHoraInicio,
      dataHoraFim: inputs.dataHoraFim
    };

    var eventos = await Evento.find().sort('createdAt DESC').limit(1);
    var eventoAtual = eventos[0];

    var evento = eventoAtual
      ? await Evento.updateOne({ id: eventoAtual.id }).set(dados)
      : await Evento.create(dados).fetch();

    return exits.success(evento);

  }

};
