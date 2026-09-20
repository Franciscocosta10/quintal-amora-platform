/**
 * Policy Mappings
 * (sails.config.policies)
 */

module.exports.policies = {

  // -------------------------------------------------------------------
  // Autenticação (públicas: cadastro e login não podem exigir login)
  // -------------------------------------------------------------------
  'auth/signup': true,
  'auth/login': true,
  'auth/logout': true,
  'auth/forgot-password': true,
  'auth/reset-password': true,
  'auth/me': ['isLoggedIn'],

  // -------------------------------------------------------------------
  // Check-in
  // -------------------------------------------------------------------
  'checkin/status': ['isLoggedIn'],
  'checkin/create': ['isLoggedIn'],
  'checkin/historico': ['isLoggedIn'],

  // Programação do evento (atividade)

  'activity': {
  'find': true,
  'create': ['isLoggedIn', 'isAdmin'],
  'update': ['isLoggedIn', 'isAdmin'],
  'delete': ['isLoggedIn', 'isAdmin']
},

  'event': {
    'actual-find': true      // dado público, usado na Home
  },
};

