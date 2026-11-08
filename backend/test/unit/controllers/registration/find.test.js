const { expect } = require('chai');
const sinon = require('sinon');
const registrationFind = require('../../../../api/controllers/registration/find');

describe('registration/find', function () {
  beforeEach(function () {
    global.Concurso = { findOne: sinon.stub().resolves({ id: 1 }) };

    const queryFalsa = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves([{ id: 1, status: 'inscrito' }])
    };
    global.InscricaoConcurso = { find: sinon.stub().returns(queryFalsa) };
  });

  afterEach(function () {
    delete global.Concurso;
    delete global.InscricaoConcurso;
  });

  it('retorna notFound quando o concurso não existe', async function () {
    global.Concurso.findOne.resolves(undefined);

    try {
      await registrationFind.fn({ concursoId: 999 });
      throw new Error('deveria ter lançado notFound');
    } catch (erro) {
      expect(erro).to.equal('notFound');
    }
  });

  it('retorna as inscrições do concurso quando ele existe', async function () {
    const resultado = await registrationFind.fn({ concursoId: 1 });
    expect(resultado).to.deep.equal([{ id: 1, status: 'inscrito' }]);
  });

  it('não filtra por status quando o filtro não é informado', async function () {
    await registrationFind.fn({ concursoId: 1 });

    const filtroUsado = global.InscricaoConcurso.find.firstCall.args[0];
    expect(filtroUsado).to.deep.equal({ concurso: 1 });
  });

  it('aplica o filtro de status quando informado', async function () {
    await registrationFind.fn({ concursoId: 1, status: 'cancelado' });

    const filtroUsado = global.InscricaoConcurso.find.firstCall.args[0];
    expect(filtroUsado).to.deep.equal({ concurso: 1, status: 'cancelado' });
  });
});