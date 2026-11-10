/**
 * Blueprint API Configuration
 * (sails.config.blueprints)
 *
 * For background on the blueprint API in Sails, check out:
 * https://sailsjs.com/docs/reference/blueprint-api
 *
 * For details and more available options, see:
 * https://sailsjs.com/config/blueprints
 *
 * SEGURANÇA: todas as rotas automáticas estão desligadas. Com os defaults
 * do Sails 1 (`rest: true`, `shortcuts: true`), qualquer model ganha rotas
 * públicas como `GET /usuario` (que devolvia e-mails e tokens de reset de
 * senha) e `GET /<model>/create|update|destroy`, sem passar pelas policies
 * do projeto. Toda rota da API deve ser declarada em `config/routes.js`
 * e ter sua policy em `config/policies.js`.
 */

module.exports.blueprints = {

  /***************************************************************************
  *                                                                          *
  * Automatically expose implicit routes for every action in your app?       *
  *                                                                          *
  ***************************************************************************/

  actions: false,


  /***************************************************************************
  *                                                                          *
  * Automatically expose RESTful routes for your models?                     *
  *                                                                          *
  ***************************************************************************/

  rest: false,


  /***************************************************************************
  *                                                                          *
  * Automatically expose CRUD "shortcut" routes to GET requests?             *
  * (These are enabled by default in development only.)                      *
  *                                                                          *
  ***************************************************************************/

  shortcuts: false,

};
