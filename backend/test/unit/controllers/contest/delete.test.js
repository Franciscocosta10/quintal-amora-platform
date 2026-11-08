const { expect } = require('chai');
const sinon = require('sinon');
const contestDelete = require('../../../../api/controllers/contest/delete');

describe('contest/delete', function () {
  beforeEach(function () {
    global.Concurso = {
      findOne: sinon.stub().resolves({ id: 1, nome: 'Concurso de Teste' }),
      destroyOne: sinon.stub().resolves()
    };
  });

  afterEach(function () {
    delete global.Concurso;
  });

  it('remove o concurso quando ele existe', async function () {
    const resultado = await contestDelete.fn({ id: 1 });

    expect(resultado).to.deep.equal({ id: 1 });
    expect(global.Concurso.destroyOne.calledOnceWith({ id: 1 })).to.be.true;
  });

  it('retorna notFound quando o concurso não existe', async function () {
    global.Concurso.findOne.resolves(undefined);

    try {
      await contestDelete.fn({ id: 999 });
      throw new Error('deveria ter lançado notFound');
    } catch (erro) {
      expect(erro).to.equal('notFound');
    }
  });

  it('não chama destroyOne quando o concurso não é encontrado', async function () {
    global.Concurso.findOne.resolves(undefined);

    try {
      await contestDelete.fn({ id: 999 });
    } catch {
      // esperado, já coberto pelo teste anterior
    }

    expect(global.Concurso.destroyOne.called).to.be.false;
  });
});