/**
 * Segurança (CORS)
 *
 * Endereços do frontend que podem chamar a API. Em produção vem do
 * FRONTEND_URL (variável de ambiente na Azure); localmente, do Vite.
 * Aceita mais de um endereço separado por vírgula. A barra final é
 * removida porque o navegador envia a origem sem ela.
 */

const origensPermitidas = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origem) => origem.trim().replace(/\/+$/, ''))
  .filter(Boolean);

module.exports.security = {

  cors: {
    allRoutes: true,
    allowOrigins: origensPermitidas,
    allowCredentials: false,
    allowRequestHeaders: 'content-type,authorization',
  },

  // csrf: false

};
