/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Por padrão nada é público automaticamente (removemos o '*': true);
 * cada rota nova precisa declarar explicitamente aqui se é pública ou
 * protegida. Isso evita o erro clássico de esquecer de proteger uma
 * rota de administração (RNF07).
 */

module.exports.policies = {

  // -------------------------------------------------------------------
  // Autenticação (públicas: cadastro e login não podem exigir login)
  // -------------------------------------------------------------------
  'auth/signup': true,
  'auth/login': true,
  'auth/logout': true,

  'auth/me': ['isLoggedIn'],

  // -------------------------------------------------------------------
  // A partir da etapa 2 (Programação), etapa 3 (Concursos) etc.,
  // outras entradas vão entrar aqui, por exemplo:
  // 'programacao/find': true,                        // leitura é pública (RF06)
  // 'programacao/create': ['isLoggedIn', 'isAdmin'],  // escrita é restrita (RF07)
  // -------------------------------------------------------------------

};
