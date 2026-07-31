/**
 * Expositor.js
 *
 * RF13–RF15: catálogo de lojas e artistas participantes. `tipo`
 * distingue loja de artista, já que a RFC trata os dois como o mesmo
 * conceito de "expositor" no cronograma/catálogo público.
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
      allowNull: true
    },

    contato: {
      type: 'string',
      allowNull: true
    },

    imagem: {
      type: 'string', // URL da imagem/logo
      allowNull: true
    },

    // Atributos type:'json' já aceitam null por padrão (Waterline não
    // permite combinar `allowNull` com type:'json'/'ref' — dá erro no lift).
    redesSociais: {
      type: 'json' // ex: { instagram: '...', site: '...' }
    },

    evento: {
      model: 'evento',
      required: true
    }

  }

};
