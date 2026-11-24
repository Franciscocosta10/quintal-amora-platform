/**
 * Libera só administradores. Roda depois da isLoggedIn, que preenche
 * `req.usuario`.
 */

module.exports = async function (req, res, proceed) {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'Usuário não autenticado.'
    });
  }

  if (req.usuario.perfil !== 'administrador') {
    return res.status(403).json({
      error: 'Acesso permitido somente para administradores.'
    });
  }

  return proceed();
};
