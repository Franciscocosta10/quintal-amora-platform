/**
 * utils/limiteLogin.js
 *
 * Proteção contra descobrir senhas por tentativa e erro (força bruta).
 * Depois de MAX_FALHAS senhas erradas para o mesmo e-mail, novas tentativas
 * para esse e-mail são recusadas até completar JANELA_MS desde a primeira
 * falha. Um login certo zera a contagem. Usado por auth/login.
 *
 * A contagem é por e-mail, e não por IP: no evento muita gente usa o mesmo
 * Wi-Fi e sairia pelo mesmo IP, e um bloqueio por IP travaria todo mundo.
 *
 * Fica na memória do servidor (uma única instância na Azure). Reiniciar o
 * servidor zera as contagens, o que é aceitável aqui.
 */

var MAX_FALHAS = 10;
var JANELA_MS = 15 * 60 * 1000;

// Acima disso, apaga os registros vencidos para a memória não crescer sem fim.
var LIMPEZA_ACIMA_DE = 10000;

// e-mail -> { quantidade, inicio }
var falhas = new Map();

function registroAtual(email, agora) {
  var registro = falhas.get(email);
  if (registro && agora - registro.inicio >= JANELA_MS) {
    falhas.delete(email);
    return undefined;
  }
  return registro;
}

function apagarVencidos(agora) {
  falhas.forEach((registro, email) => {
    if (agora - registro.inicio >= JANELA_MS) {
      falhas.delete(email);
    }
  });
}

module.exports = {

  MAX_FALHAS: MAX_FALHAS,
  JANELA_MS: JANELA_MS,

  /**
   * Minutos que faltam para o e-mail poder tentar de novo (0 = liberado).
   */
  minutosBloqueado: function (email, agora) {
    agora = agora || Date.now();
    var registro = registroAtual(email, agora);
    if (!registro || registro.quantidade < MAX_FALHAS) {
      return 0;
    }
    return Math.ceil((JANELA_MS - (agora - registro.inicio)) / 60000);
  },

  registrarFalha: function (email, agora) {
    agora = agora || Date.now();
    if (falhas.size >= LIMPEZA_ACIMA_DE) {
      apagarVencidos(agora);
    }
    var registro = registroAtual(email, agora);
    if (registro) {
      registro.quantidade++;
    } else {
      falhas.set(email, { quantidade: 1, inicio: agora });
    }
  },

  zerar: function (email) {
    falhas.delete(email);
  },

  // Usado pelos testes.
  zerarTudo: function () {
    falhas.clear();
  },

  totalRegistros: function () {
    return falhas.size;
  }

};
