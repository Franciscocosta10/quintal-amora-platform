const { expect } = require('chai');
const sinon = require('sinon');
const healthCheck = require('../../../../api/controllers/health/check');
const criarExits = require('../../support/exits');

describe('health/check (monitoramento)', function () {
  let exits;
  let sendNativeQuery;

  beforeEach(function () {
    exits = criarExits('indisponivel');
    sendNativeQuery = sinon.stub().resolves({ rows: [{ '?column?': 1 }] });
    global.sails = {
      getDatastore: sinon.stub().returns({ sendNativeQuery }),
      log: { error: sinon.stub() }
    };
  });

  afterEach(function () {
    delete global.sails;
  });

  it('responde ok quando a API e o banco estão funcionando', async function () {
    await healthCheck.fn({}, exits);

    expect(sendNativeQuery.firstCall.args[0]).to.equal('SELECT 1');
    const resposta = exits.success.firstCall.args[0];
    expect(resposta).to.include({ status: 'ok', banco: 'ok' });
    expect(new Date(resposta.horario).toISOString()).to.equal(resposta.horario);
    expect(resposta.tempoNoArSegundos).to.be.a('number').and.at.least(0);
  });

  it('responde indisponível (503) e registra o erro quando o banco não responde', async function () {
    const falha = new Error('connection refused');
    sendNativeQuery.rejects(falha);

    await healthCheck.fn({}, exits);

    expect(exits.success.called).to.be.false;
    expect(exits.indisponivel.firstCall.args[0]).to.include({ status: 'erro', banco: 'indisponivel' });
    expect(global.sails.log.error.firstCall.args[1]).to.equal(falha);
  });

  it('não expõe detalhes do erro do banco na resposta', async function () {
    sendNativeQuery.rejects(new Error('password authentication failed for user "quintal_admin"'));

    await healthCheck.fn({}, exits);

    expect(JSON.stringify(exits.indisponivel.firstCall.args[0])).to.not.include('quintal_admin');
  });
});
