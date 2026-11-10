/**
 * utils/expositor.js
 *
 * Regras de formato do Expositor compartilhadas por expositor/create e
 * expositor/update. Fica fora de api/helpers de propósito: é uma função
 * pura (sem banco, sem `sails`), então um `require` simples basta e os
 * testes unitários não precisam simular `sails.helpers`.
 *
 * Por que validar URL aqui: `imagem` vira `<img src>` e as redes sociais
 * viram `<a href>` no catálogo público. Sem essa checagem um admin (ou um
 * token de admin vazado) poderia gravar `javascript:...` e executar script
 * no navegador de qualquer visitante — por isso só http/https passam.
 */

// Import explícito (em vez do `_` global do Sails) para o módulo funcionar
// isolado, inclusive nos testes.
var _ = require('@sailshq/lodash');

var TIPOS = ['loja', 'artista'];

var REDES_SOCIAIS = ['instagram', 'facebook', 'tiktok', 'site'];

var CAMPOS_TEXTO_OPCIONAIS = ['descricao', 'localizacaoEstande', 'contato', 'imagem'];

function erroBadRequest(mensagem) {
  return { badRequest: { message: mensagem } };
}

function ehUrlHttp(valor) {
  try {
    var url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (unusedErro) {
    return false;
  }
}

function normalizarTextoOpcional(valor) {
  if (valor === null) {
    return null;
  }

  var texto = valor.trim();
  return texto === '' ? null : texto;
}

function normalizarRedesSociais(redes) {
  if (redes === null) {
    return null;
  }

  if (!_.isPlainObject(redes)) {
    throw erroBadRequest('redesSociais deve ser um objeto, ex.: { "instagram": "https://..." }.');
  }

  var resultado = {};

  _.each(redes, (link, rede) => {
    if (!_.contains(REDES_SOCIAIS, rede)) {
      throw erroBadRequest('Rede social não suportada: ' + rede + '.');
    }

    if (link === null || link === undefined) {
      return;
    }

    if (!_.isString(link)) {
      throw erroBadRequest('O link de ' + rede + ' deve ser um texto.');
    }

    var linkLimpo = link.trim();
    if (linkLimpo === '') {
      return;
    }

    if (!ehUrlHttp(linkLimpo)) {
      throw erroBadRequest('O link de ' + rede + ' deve ser uma URL começando com http:// ou https://.');
    }

    resultado[rede] = linkLimpo;
  });

  // Objeto vazio e null significam a mesma coisa ("sem redes"); guardar
  // sempre null evita o front precisar tratar os dois casos.
  return _.isEmpty(resultado) ? null : resultado;
}

/**
 * Recebe os campos vindos da action (só os que foram enviados) e devolve
 * uma cópia normalizada: textos sem espaços nas pontas, vazios virando
 * null e URLs validadas. Lança `{ badRequest }` no formato que as actions
 * já usam, para cair direto no exit `badRequest`.
 */
function normalizarCampos(campos) {
  var normalizados = _.extend({}, campos);

  if (normalizados.nome !== undefined) {
    normalizados.nome = normalizados.nome.trim();

    if (normalizados.nome === '') {
      throw erroBadRequest('Informe o nome do expositor.');
    }
  }

  CAMPOS_TEXTO_OPCIONAIS.forEach((campo) => {
    if (normalizados[campo] !== undefined) {
      normalizados[campo] = normalizarTextoOpcional(normalizados[campo]);
    }
  });

  if (normalizados.imagem && !ehUrlHttp(normalizados.imagem)) {
    throw erroBadRequest('A imagem deve ser uma URL começando com http:// ou https://.');
  }

  if (normalizados.redesSociais !== undefined) {
    normalizados.redesSociais = normalizarRedesSociais(normalizados.redesSociais);
  }

  return normalizados;
}

module.exports = {
  TIPOS: TIPOS,
  REDES_SOCIAIS: REDES_SOCIAIS,
  ehUrlHttp: ehUrlHttp,
  normalizarCampos: normalizarCampos
};
