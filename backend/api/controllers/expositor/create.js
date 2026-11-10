/**
 * expositor/create.js
 *
 * RF15: cadastro de loja/artista pelo administrador. Protegida por
 * ['isLoggedIn', 'isAdmin'] em config/policies.js.
 */
var regrasExpositor = require('../../utils/expositor');

module.exports = {

  friendlyName: 'Create expositor',

  description: 'Cadastra uma nova loja ou artista no catálogo (somente admin).',

  inputs: {

    nome: { type: 'string', required: true, maxLength: 120 },

    tipo: { type: 'string', required: true, isIn: regrasExpositor.TIPOS },

    descricao: { type: 'string', allowNull: true, maxLength: 2000 },

    localizacaoEstande: { type: 'string', allowNull: true, maxLength: 80 },

    contato: { type: 'string', allowNull: true, maxLength: 120 },

    imagem: { type: 'string', allowNull: true, maxLength: 2048 },

    // 'json' aceita objeto ou null; o formato é conferido em utils/expositor.
    redesSociais: { type: 'json' },

    evento: { type: 'number', required: true }

  },

  exits: {
    success: { description: 'Expositor criado com sucesso.' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function (inputs) {

    var dados = regrasExpositor.normalizarCampos(inputs);

    var eventoExiste = await Evento.findOne({ id: dados.evento });
    if (!eventoExiste) {
      throw { badRequest: { message: 'Evento informado não existe.' } };
    }

    var novoExpositor = await Expositor.create(dados).fetch();

    return novoExpositor;

  }

};
