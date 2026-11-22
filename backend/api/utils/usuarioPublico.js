/**
 * utils/usuarioPublico.js
 *
 * Lista única dos campos do usuário que nunca podem sair nas respostas da
 * API: a senha (hash bcrypt) e os dados internos da recuperação de senha
 * (hash do token e validade). Usado pelo `customToJSON` do model Usuario e
 * pelas actions de autenticação que devolvem o próprio usuário (login,
 * cadastro, /auth/me, edição de perfil e troca de foto).
 *
 * Centralizar aqui evita que um campo sensível novo seja escondido em uma
 * rota e esquecido em outra.
 */

var CAMPOS_PRIVADOS = ['senha', 'resetPasswordToken', 'resetPasswordExpiresAt'];

/**
 * Devolve uma cópia do usuário sem os campos privados. Não altera o objeto
 * recebido.
 */
function semCamposPrivados(usuario) {
  var copia = Object.assign({}, usuario);
  CAMPOS_PRIVADOS.forEach((campo) => {
    delete copia[campo];
  });
  return copia;
}

module.exports = {
  CAMPOS_PRIVADOS,
  semCamposPrivados
};
