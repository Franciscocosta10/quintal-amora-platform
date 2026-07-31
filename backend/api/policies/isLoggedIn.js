/**
 * isLoggedIn.js
 *
 * Policy de autenticação (RNF05). Espera o header:
 *   Authorization: Bearer <token>
 *
 * Se válido, popula `req.usuario` com o registro completo do banco
 * (não confia apenas no payload do token) e libera a requisição.
 * Qualquer controller/action pode então usar `this.req.usuario`.
 */

module.exports = async function (req, res, proceed) {
  var jwt = require('jsonwebtoken');

  var authHeader = req.headers.authorization;
  if (!authHeader || authHeader.indexOf('Bearer ') !== 0) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  var token = authHeader.split(' ')[1];

  var decoded;
  try {
    decoded = jwt.verify(token, sails.config.custom.jwtSecret);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  var usuario = await Usuario.findOne({ id: decoded.id });
  if (!usuario || !usuario.ativo) {
    return res.status(401).json({ error: 'Usuário inválido ou inativo.' });
  }

  req.usuario = usuario;
  return proceed();
};
