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
  'auth/change-profile': ['isLoggedIn'],

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

  // Concursos
    'contest': {
    'find': true,
    'create': ['isLoggedIn', 'isAdmin'],
    'update': ['isLoggedIn', 'isAdmin'],
    'delete': ['isLoggedIn', 'isAdmin']
  },

  'registration': {
    'create': ['isLoggedIn'],
    'find': ['isLoggedIn', 'isAdmin'],
    'find-mine': ['isLoggedIn'],
    'cancel': ['isLoggedIn']
  },

  'event': {
    'actual-find': true      // dado público, usado na Home
  },

  // Catálogo de lojas e artistas (RF13–RF15)
  'expositor': {
    // Nega por padrão: além das 4 actions abaixo, o Sails expõe blueprints
    // automáticos do model (findOne, populate, add, remove...). O '*'
    // garante que qualquer um deles exija admin; só `find` fica público.
    '*': ['isLoggedIn', 'isAdmin'],
    'find': true,            // RF13 (lista) e RF14 (detalhe) — catálogo público
    'create': ['isLoggedIn', 'isAdmin'],
    'update': ['isLoggedIn', 'isAdmin'],
    'destroy': ['isLoggedIn', 'isAdmin']
  },
};

