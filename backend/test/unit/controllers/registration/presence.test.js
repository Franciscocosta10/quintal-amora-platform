const { expect } = require('chai');
const sinon = require('sinon');
const registrationPresence = require('../../../../api/controllers/registration/presence');

describe('registration/presence', function () {
  let exits;
  let set;

  beforeEach(function () {
    set = sinon.stub().resolves({ id: 4, presencaConfirmada: true });
    global.InscricaoConcurso = {
      findOne: sinon.stub().resolves({ id: 4, status: 'inscrito' }),
      updateOne: sinon.stub().returns({ set: set })
    };
    exits = { success: sinon.stub(), notFound: sinon.stub(), inscricaoCancelada: sinon.stub() };
  });

  afterEach(function () {
    delete global.InscricaoConcurso;
  });

  it('marca a presença do inscrito', async function () {
    await registrationPresence.fn({ id: 4, presencaConfirmada: true }, exits);

    expect(global.InscricaoConcurso.updateOne.firstCall.args[0]).to.deep.equal({ id: 4 });
    expect(set.firstCall.args[0]).to.deep.equal({ presencaConfirmada: true });
    expect(exits.success.firstCall.args[0]).to.deep.equal({ id: 4, presencaConfirmada: true });
  });

  it('avisa quando a inscrição não existe', async function () {
    global.InscricaoConcurso.findOne.resolves(undefined);

    await registrationPresence.fn({ id: 99, presencaConfirmada: true }, exits);

    expect(exits.notFound.calledOnce).to.equal(true);
    expect(global.InscricaoConcurso.updateOne.called).to.equal(false);
  });

  it('não marca presença em inscrição cancelada', async function () {
    global.InscricaoConcurso.findOne.resolves({ id: 4, status: 'cancelado' });

    await registrationPresence.fn({ id: 4, presencaConfirmada: true }, exits);

    expect(exits.inscricaoCancelada.calledOnce).to.equal(true);
    expect(global.InscricaoConcurso.updateOne.called).to.equal(false);
  });
});
