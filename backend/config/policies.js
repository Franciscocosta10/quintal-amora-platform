/**
 * Policy Mappings
 * (sails.config.policies)
 */

module.exports.policies = {

  // -------------------------------------------------------------------
  // Padrão: nega tudo que não estiver mapeado abaixo (403).
  //
  // No Sails as policies NÃO são cumulativas: qualquer chave explícita
  // (ex.: 'contest/find', 'activity/*') substitui este '*' por completo.
  // Então este padrão só vale para actions esquecidas aqui, como uma action
  // nova sem policy ou uma action de blueprint (`usuario/find`...) ligada
  // por engano em routes.js. Toda action nova precisa de uma entrada
  // explícita: `true` para pública, ['isLoggedIn'] ou
  // ['isLoggedIn', 'isAdmin'].
  // -------------------------------------------------------------------
  '*': false,

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
};

