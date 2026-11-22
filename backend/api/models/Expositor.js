/**
 * RF13–RF15 — lojas e artistas do catálogo (`tipo` diferencia os dois).
 * As regras de formato (URLs, redes sociais) ficam em api/utils/expositor.js.
 */

module.exports = {

  attributes: {

    nome: {
      type: 'string',
      required: true
    },

    tipo: {
      type: 'string',
      isIn: ['loja', 'artista'],
      required: true
    },

    descricao: {
      type: 'string',
      columnType: 'text',
      allowNull: true
    },

    localizacaoEstande: {
      type: 'string',
      allowNull: true // ex.: "Estande 12 — Corredor B"
    },

    contato: {
      type: 'string',
      allowNull: true // e-mail ou telefone/WhatsApp exibido no detalhe
    },

    imagem: {
      type: 'string', // URL http(s) da imagem/logo
      allowNull: true
    },

    // Atributos type:'json' já aceitam null por padrão (Waterline não
    // permite combinar `allowNull` com type:'json'/'ref' — dá erro no lift).
    // Chaves aceitas: instagram, youtube, tiktok, site (todas URLs http/s).
    redesSociais: {
      type: 'json' // ex: { instagram: 'https://instagram.com/loja', site: '...' }
    },

    evento: {
      model: 'evento',
      required: true
    }

  }

};
