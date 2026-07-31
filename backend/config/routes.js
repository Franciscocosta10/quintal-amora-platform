module.exports.routes = {
  'POST /auth/signup': { action: 'auth/signup' },
  'POST /auth/login': { action: 'auth/login' },
  'POST /auth/logout': { action: 'auth/logout' },
  'GET /auth/me': { action: 'auth/me' }
};
