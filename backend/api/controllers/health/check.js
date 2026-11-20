/**
 * health/check.js
 *
 * Verificação de saúde da API (monitoramento / RNF08 — disponibilidade).
 * Consultada pelo monitor de disponibilidade do New Relic: responde 200
 * quando a API está no ar e consegue falar com o banco, e 503 quando o
 * banco não responde — o que dispara o alerta.
 *
 * Pública de propósito (o monitor não tem login) e sem dados do sistema
 * além do necessário para saber se está tudo funcionando.
 *
 * GET /health
 */

module.exports = {

  friendlyName: 'Health check',

  description: 'Informa se a API e o banco de dados estão funcionando.',

  exits: {
    success: {
      statusCode: 200
    },
    indisponivel: {
      statusCode: 503,
      description: 'A API está no ar, mas o banco de dados não respondeu.'
    }
  },

  fn: async function (inputs, exits) {
    const horario = new Date().toISOString();

    try {
      await sails.getDatastore().sendNativeQuery('SELECT 1');
    } catch (erro) {
      sails.log.error('Health check: banco de dados indisponível.', erro);
      return exits.indisponivel({ status: 'erro', banco: 'indisponivel', horario });
    }

    return exits.success({
      status: 'ok',
      banco: 'ok',
      horario,
      tempoNoArSegundos: Math.round(process.uptime())
    });
  }

};
