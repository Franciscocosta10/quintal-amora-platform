/**
 * Proteção contra força bruta no login (usada por auth/login). Depois de
 * MAX_FALHAS senhas erradas para o mesmo e-mail, esse e-mail fica
 * bloqueado até completar JANELA_MS desde a primeira falha. Um login certo
 * zera a contagem.
 *
 * Conta por e-mail, não por IP, porque no evento muita gente divide o
 * mesmo Wi-Fi. Fica na memória do servidor (uma instância só), então
 * reiniciar zera as contagens.
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
