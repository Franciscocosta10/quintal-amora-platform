/**
 * Allowlist dos campos do usuário que podem sair nas respostas da API
 * (usada pelo model Usuario e pelas actions de auth). Um campo novo do
 * model só sai se for incluído em CAMPOS_PUBLICOS.
 */

var CAMPOS_PUBLICOS = ['id', 'nomeCompleto', 'email', 'perfil', 'fotoPerfil', 'ativo', 'createdAt', 'updatedAt'];

/**
 * Devolve um objeto novo só com os campos públicos que o usuário tem. Não
 * altera o objeto recebido.
 */
function apenasCamposPublicos(usuario) {
  var publico = {};
  CAMPOS_PUBLICOS.forEach((campo) => {
    if (usuario && Object.prototype.hasOwnProperty.call(usuario, campo)) {
      publico[campo] = usuario[campo];
    }
  });
  return publico;
}

module.exports = {
  CAMPOS_PUBLICOS,
  apenasCamposPublicos
};
