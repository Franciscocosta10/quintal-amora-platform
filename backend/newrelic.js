'use strict';

// Os nomes das opções (app_name, license_key...) são definidos pelo New Relic.
/* eslint-disable camelcase */

/**
 * newrelic.js
 *
 * Configuração do agente de monitoramento (APM) do New Relic.
 * O agente só é carregado pelo app.js quando NEW_RELIC_LICENSE_KEY existe,
 * ou seja, no servidor de produção. Localmente e no CI ele fica desligado.
 *
 * Variáveis de ambiente (definidas no servidor, nunca no código):
 *   NEW_RELIC_LICENSE_KEY  chave "INGEST - LICENSE" da conta do New Relic
 *   NEW_RELIC_APP_NAME     nome do app no painel (padrão: quintal-amora-backend)
 */

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'quintal-amora-backend'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  // Liga as requisições do frontend às chamadas internas da API e do banco.
  distributed_tracing: {
    enabled: true
  },

  // Log do agente vai para a saída padrão, junto com os logs do servidor.
  logging: {
    level: 'info',
    filepath: 'stdout'
  },

  // 401 (sem login) e 403 (sem permissão) são a segurança funcionando, não
  // falhas: continuam visíveis no painel, mas não entram na taxa de erro,
  // no Apdex nem nos alertas.
  error_collector: {
    expected_status_codes: [401, 403]
  },

  // O servidor roda na Azure: não procura AWS nem Google Cloud ao iniciar
  // (evita erros sem importância no log a cada reinício).
  utilization: {
    detect_aws: false,
    detect_gcp: false
  },

  // Dados sensíveis nunca saem do servidor (LGPD): token JWT, cookies e
  // parâmetros das requisições (que podem conter e-mail e senha).
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'request.parameters.*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
};
