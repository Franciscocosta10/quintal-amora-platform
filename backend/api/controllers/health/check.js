/**
 * Verificação de saúde usada pelo monitor do New Relic (RNF08): 200
 * quando a API e o banco respondem, 503 quando o banco não responde.
 * Pública de propósito, porque o monitor não tem login.
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
