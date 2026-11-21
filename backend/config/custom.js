require('dotenv').config();

// FRONTEND_URL pode ter mais de um endereço separado por vírgula (ver
// config/security.js). Para montar links nos e-mails usa-se o primeiro,
// sem barra final, para não gerar "//redefinir-senha".
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')[0]
  .trim()
  .replace(/\/+$/, '');

module.exports.custom = {

  frontendUrl,

  jwtSecret: process.env.JWT_SECRET,

  jwtExpiresIn: '7d'

};
