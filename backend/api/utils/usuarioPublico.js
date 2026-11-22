/**
 * utils/usuarioPublico.js
 *
 * Define quais campos do usuário podem sair nas respostas da API. Usado
 * pelo `customToJSON` do model Usuario e pelas actions de autenticação que
 * devolvem o próprio usuário (login, cadastro, /auth/me, edição de perfil e
 * troca de foto).
 *
 * Abordagem de allowlist: só os campos listados em CAMPOS_PUBLICOS saem.
 * Qualquer atributo novo do model (ex.: um token, um telefone) fica fora da
 * resposta até alguém decidir, de propósito, incluí-lo aqui. Assim a senha
 * (hash bcrypt) e os dados internos da recuperação de senha nunca vazam,
 * nem os que ainda vierem a existir.
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
