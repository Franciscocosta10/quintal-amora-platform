const { expect } = require('chai');
const limiteLogin = require('../../../api/utils/limiteLogin');

describe('utils/limiteLogin', function () {
  const MINUTO = 60 * 1000;
  const inicio = 1000000000000;

  function errar(vezes, email, agora) {
    for (let i = 0; i < vezes; i++) {
      limiteLogin.registrarFalha(email, agora);
    }
  }

  beforeEach(function () {
    limiteLogin.zerarTudo();
  });

  it('libera e-mail sem falhas', function () {
    expect(limiteLogin.minutosBloqueado('ana@email.com', inicio)).to.equal(0);
  });

  it('só bloqueia ao chegar no limite de falhas', function () {
    errar(limiteLogin.MAX_FALHAS - 1, 'ana@email.com', inicio);
    expect(limiteLogin.minutosBloqueado('ana@email.com', inicio)).to.equal(0);

    limiteLogin.registrarFalha('ana@email.com', inicio);
    expect(limiteLogin.minutosBloqueado('ana@email.com', inicio)).to.equal(15);
  });

  it('informa os minutos restantes, arredondando para cima', function () {
    errar(limiteLogin.MAX_FALHAS, 'ana@email.com', inicio);

    expect(limiteLogin.minutosBloqueado('ana@email.com', inicio + 10 * MINUTO)).to.equal(5);
    expect(limiteLogin.minutosBloqueado('ana@email.com', inicio + 14.5 * MINUTO)).to.equal(1);
  });

  it('libera de novo quando a janela acaba e começa a contar do zero', function () {
    errar(limiteLogin.MAX_FALHAS, 'ana@email.com', inicio);
    const depois = inicio + limiteLogin.JANELA_MS;

    expect(limiteLogin.minutosBloqueado('ana@email.com', depois)).to.equal(0);
    limiteLogin.registrarFalha('ana@email.com', depois);
    expect(limiteLogin.minutosBloqueado('ana@email.com', depois)).to.equal(0);
  });

  it('zerar libera o e-mail na hora', function () {
    errar(limiteLogin.MAX_FALHAS, 'ana@email.com', inicio);
    limiteLogin.zerar('ana@email.com');

    expect(limiteLogin.minutosBloqueado('ana@email.com', inicio)).to.equal(0);
  });

  it('usa o horário atual quando nenhum é informado', function () {
    errar(limiteLogin.MAX_FALHAS, 'ana@email.com');

    expect(limiteLogin.minutosBloqueado('ana@email.com')).to.equal(15);
  });

  it('apaga registros vencidos quando acumula muitos e-mails', function () {
    for (let i = 0; i < 10000; i++) {
      limiteLogin.registrarFalha('pessoa' + i + '@email.com', inicio);
    }
    expect(limiteLogin.totalRegistros()).to.equal(10000);

    limiteLogin.registrarFalha('nova@email.com', inicio + limiteLogin.JANELA_MS);

    expect(limiteLogin.totalRegistros()).to.equal(1);
  });
});
