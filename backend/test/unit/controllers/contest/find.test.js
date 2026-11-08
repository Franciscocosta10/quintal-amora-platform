const { expect } = require('chai');
const sinon = require('sinon');
const contestFind = require('../../../../api/controllers/contest/find');

describe('contest/find', function () {
  beforeEach(function () {
    global._ = require('@sailshq/lodash');

    const concursosFalsos = [
      { id: 1, nome: 'Concurso A' },
      { id: 2, nome: 'Concurso B' }
    ];

    const queryFalsa = { sort: sinon.stub().resolves(concursosFalsos) };
    global.Concurso = { find: sinon.stub().returns(queryFalsa) };

    global.InscricaoConcurso = {
      find: sinon.stub().resolves([
        { id: 100, concurso: 1, status: 'inscrito' },
        { id: 101, concurso: 1, status: 'confirmado' },
        { id: 102, concurso: 1, status: 'inscrito' }
        // concurso 2 não tem nenhuma inscrição
      ])
    };
  });

  afterEach(function () {
    delete global.Concurso;
    delete global.InscricaoConcurso;
    delete global._;
  });

  it('retorna os concursos com totalInscritos calculado em uma única consulta extra', async function () {
    const resultado = await contestFind.fn({});

    expect(global.InscricaoConcurso.find.calledOnce).to.be.true;
    expect(resultado).to.have.lengthOf(2);
    expect(resultado[0].totalInscritos).to.equal(3);
    expect(resultado[1].totalInscritos).to.equal(0);
  });

  it('não conta inscrições canceladas na contagem de vagas', async function () {
    await contestFind.fn({});

    const filtroUsado = global.InscricaoConcurso.find.firstCall.args[0];
    expect(filtroUsado.status).to.deep.equal({ '!=': 'cancelado' });
  });

  it('não consulta InscricaoConcurso quando não há concursos (evita query desnecessária)', async function () {
    global.Concurso.find.returns({ sort: sinon.stub().resolves([]) });

    const resultado = await contestFind.fn({});

    expect(resultado).to.deep.equal([]);
    expect(global.InscricaoConcurso.find.called).to.be.false;
  });

  it('aplica os filtros de eventoId, status e categoria na query', async function () {
    await contestFind.fn({ eventoId: 5, status: 'aberto', categoria: 'cosplay' });

    const filtroUsado = global.Concurso.find.firstCall.args[0];
    expect(filtroUsado).to.deep.equal({ evento: 5, status: 'aberto', categoria: 'cosplay' });
  });
});