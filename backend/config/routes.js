module.exports.routes = {

  // Login e registro
  'POST /auth/signup': { action: 'auth/signup' },

  'POST /auth/login': { action: 'auth/login' },

  'POST /auth/logout': { action: 'auth/logout' },

  'GET /auth/me': { action: 'auth/me' },

  'POST /auth/forgot-password': { action: 'auth/forgot-password' },

  'POST /auth/reset-password': { action: 'auth/reset-password' },

  'PUT /auth/change-profile': { action: 'auth/change-profile'},

  // Check-in
  'POST /checkin': { action: 'checkin/create' },

  'GET /checkin/status/:eventoId': { action: 'checkin/status' },

  'GET /checkin/historico': { action: 'checkin/historico' },

  // Programação
  'GET /activity': { action: 'activity/find' },

  'POST /activity/create': { action: 'activity/create' },

  'PUT /activity/update/:id': { action: 'activity/update' },

  'DELETE /activity/delete/:id': { action: 'activity/delete' },

  // Concursos
  'GET /contest': { action: 'contest/find' },

  'POST /contest/create': { action: 'contest/create' },

  'PUT /contest/update/:id': { action: 'contest/update' },

  'DELETE /contest/delete/:id': { action: 'contest/delete' },

  // Inscrições em concursos
  'POST /contest/:concursoId/register': { action: 'registration/create' },

  'GET /contest/:concursoId/registrations': { action: 'registration/find' },

  'GET /registration/mine': { action: 'registration/find-mine' },

  'DELETE /registration/:id': { action: 'registration/cancel' },

  // Home
  'GET /event/actual-find': { action: 'event/actual-find' },
};