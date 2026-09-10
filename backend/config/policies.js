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
};
