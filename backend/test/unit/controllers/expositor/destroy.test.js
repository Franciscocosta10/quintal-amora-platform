const { expect } = require('chai');
const sinon = require('sinon');
const expositorDestroy = require('../../../../api/controllers/expositor/destroy');

describe('expositor/destroy', function () {
  beforeEach(function () {
    global.Expositor = {
      findOne: sinon.stub().resolves({ id: 3 }),
      destroyOne: sinon.stub().resolves({ id: 3 })
    };
  });

  afterEach(function () {
    delete global.Expositor;
  });

  it('remove o expositor e retorna o id removido', async function () {
    const resultado = await expositorDestroy.fn({ id: 3 });

    expect(resultado).to.deep.equal({ id: 3 });
    expect(global.Expositor.destroyOne.firstCall.args[0]).to.deep.equal({ id: 3 });
  });

  it('lança notFound quando o expositor não existe', async function () {
    global.Expositor.findOne.resolves(undefined);

    try {
      await expositorDestroy.fn({ id: 999 });
      throw new Error('deveria ter lançado notFound');
    } catch (erro) {
      expect(erro).to.equal('notFound');
    }

    expect(global.Expositor.destroyOne.called).to.be.false;
  });
});
