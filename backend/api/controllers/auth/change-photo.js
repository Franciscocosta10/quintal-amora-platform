/**
 * Troca (ou remove, com `null`) a foto de perfil do usuário logado.
 */

var TAMANHO_MAXIMO = 400 * 1024; // caracteres da data URL (~300 KB de imagem)
var FORMATO_FOTO = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

var usuarioPublico = require('../../utils/usuarioPublico');

module.exports = {

  friendlyName: 'Change photo',

  description: 'Troca ou remove a foto de perfil do usuário autenticado.',

  inputs: {
    fotoPerfil: {
      type: 'string',
      allowNull: true
    }
  },

  exits: {
    success: {
      description: 'Foto atualizada.'
    },
    badRequest: {
      statusCode: 400,
      description: 'Foto em formato inválido ou grande demais.'
    }
  },

  fn: async function (inputs) {
    var foto = inputs.fotoPerfil;

    if (foto === undefined) {
      throw { badRequest: { message: 'Envie uma foto (ou null para remover).' } };
    }

    if (foto !== null) {
      if (foto.length > TAMANHO_MAXIMO) {
        throw { badRequest: { message: 'A foto é grande demais. Escolha uma imagem menor.' } };
      }
      if (!FORMATO_FOTO.test(foto)) {
        throw { badRequest: { message: 'Envie uma imagem JPG, PNG ou WebP.' } };
      }
    }

    var usuarioAtualizado = await Usuario
      .updateOne({ id: this.req.usuario.id })
      .set({ fotoPerfil: foto });

    return usuarioPublico.apenasCamposPublicos(usuarioAtualizado);
  }

};
