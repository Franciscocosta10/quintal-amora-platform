const { expect } = require('chai');
const sinon = require('sinon');
const registrationFind = require('../../../../api/controllers/registration/find');

describe('registration/find', function () {
  beforeEach(function () {
    global._ = require('@sailshq/lodash');
    global.Concurso = { findOne: sinon.stub().resolves({ id: 1 }) };

    const queryFalsa = {
      sort: sinon.stub().resolves([
        { id: 1, status: 'inscrito', usuario: 7 },
        { id: 2, status: 'inscrito', usuario: 9 }
      ])
    };
    global.InscricaoConcurso = { find: sinon.stub().returns(queryFalsa) };
    global.Usuario = {
      find: sinon.stub().resolves([{ id: 7, nomeCompleto: 'Ana', email: 'ana@x.com' }])
    };
  });

  afterEach(function () {
    delete global._;
    delete global.Concurso;
    delete global.InscricaoConcurso;
    delete global.Usuario;
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

  it('retorna as inscrições com nome e e-mail de cada inscrito', async function () {
    const resultado = await registrationFind.fn({ concursoId: 1 });

    expect(global.Usuario.find.firstCall.args[0]).to.deep.equal({
      where: { id: { in: [7, 9] } },
      select: ['nomeCompleto', 'email']
    });
    expect(resultado).to.deep.equal([
      { id: 1, status: 'inscrito', usuario: { id: 7, nomeCompleto: 'Ana', email: 'ana@x.com' } },
      { id: 2, status: 'inscrito', usuario: null }
    ]);
  });

  it('não consulta usuários quando o concurso não tem inscrições', async function () {
    global.InscricaoConcurso.find.returns({ sort: sinon.stub().resolves([]) });

    const resultado = await registrationFind.fn({ concursoId: 1 });

    expect(resultado).to.deep.equal([]);
    expect(global.Usuario.find.called).to.equal(false);
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