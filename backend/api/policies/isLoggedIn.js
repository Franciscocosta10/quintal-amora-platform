/**
 * Autenticação (RNF05): valida o header `Authorization: Bearer <token>`
 * e preenche `req.usuario` com o registro do banco (não confia só no
 * conteúdo do token).
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
  } catch (unusedErr) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  var usuario = await Usuario.findOne({ id: decoded.id });
  if (!usuario || !usuario.ativo) {
    return res.status(401).json({ error: 'Usuário inválido ou inativo.' });
  }

  req.usuario = usuario;
  return proceed();
};
