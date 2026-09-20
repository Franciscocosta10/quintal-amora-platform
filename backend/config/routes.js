module.exports.routes = {

  'POST /auth/signup': { action: 'auth/signup' },

  'POST /auth/login': { action: 'auth/login' },

  'POST /auth/logout': { action: 'auth/logout' },

  'GET /auth/me': { action: 'auth/me' },

  'POST /auth/forgot-password': { action: 'auth/forgot-password' },

  'POST /auth/reset-password': { action: 'auth/reset-password' },

  'POST /checkin': { action: 'checkin/create' },

  'GET /checkin/status/:eventoId': { action: 'checkin/status' },

  'GET /checkin/historico': { action: 'checkin/historico' },

  // Programação
  'GET /activity': { action: 'activity/find' },

  'POST /activity/create': { action: 'activity/create' },

  'PUT /activity/update/:id': { action: 'activity/update' },

  'DELETE /activity/delete/:id': { action: 'activity/delete' },

  // Home
  'GET /event/actual-find': { action: 'event/actual-find' },
};