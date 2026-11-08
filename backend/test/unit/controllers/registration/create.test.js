const { expect } = require('chai');
const sinon = require('sinon');
const registrationCreate = require('../../../../api/controllers/registration/create');

describe('registration/create', function () {
  let relogio;
  let concursoAberto;
  let contexto;

  beforeEach(function () {
    relogio = sinon.useFakeTimers(new Date('2026-11-12T10:00:00-03:00').getTime());

    concursoAberto = {
      id: 1,
      status: 'aberto',
      inicioInscricao: new Date('2026-11-10T00:00:00-03:00').getTime(),
      fimInscricao: new Date('2026-11-15T23:59:59-03:00').getTime(),
      limiteParticipantes: 2
    };

    global.Concurso = { findOne: sinon.stub().resolves(concursoAberto) };
    global.InscricaoConcurso = {
      findOne: sinon.stub().resolves(undefined),
      count: sinon.stub().resolves(0),
      create: sinon.stub().returns({ fetch: sinon.stub().resolves({ id: 42, status: 'inscrito' }) })
    };

    contexto = { req: { usuario: { id: 7 } } };
  });

  afterEach(function () {
    relogio.restore();
    delete global.Concurso;
    delete global.InscricaoConcurso;
  });

  it('inscreve com sucesso quando tudo está dentro das regras', async function () {
    const resultado = await registrationCreate.fn.call(contexto, { concursoId: 1 });
    expect(resultado).to.deep.equal({ id: 42, status: 'inscrito' });
  });

  it('retorna notFound quando o concurso não existe', async function () {
    global.Concurso.findOne.resolves(undefined);

    try {
      await registrationCreate.fn.call(contexto, { concursoId: 999 });
      throw new Error('deveria ter lançado notFound');
    } catch (erro) {
      expect(erro).to.equal('notFound');
    }
  });

  it('rejeita quando o concurso não está com status "aberto"', async function () {
    concursoAberto.status = 'encerrado';

    try {
      await registrationCreate.fn.call(contexto, { concursoId: 1 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('Inscrições encerradas para este concurso.');
    }
  });

  it('rejeita quando ainda não chegou o início das inscrições', async function () {
    relogio.restore();
    relogio = sinon.useFakeTimers(new Date('2026-11-01T10:00:00-03:00').getTime());

    try {
      await registrationCreate.fn.call(contexto, { concursoId: 1 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('As inscrições para este concurso ainda não foram abertas.');
    }
  });

  it('rejeita quando o período de inscrição já encerrou', async function () {
    relogio.restore();
    relogio = sinon.useFakeTimers(new Date('2026-11-20T10:00:00-03:00').getTime());

    try {
      await registrationCreate.fn.call(contexto, { concursoId: 1 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('O período de inscrição deste concurso já foi encerrado.');
    }
  });

  it('rejeita inscrição duplicada do mesmo usuário', async function () {
    global.InscricaoConcurso.findOne.resolves({ id: 10, status: 'inscrito' });

    try {
      await registrationCreate.fn.call(contexto, { concursoId: 1 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('Você já está inscrito neste concurso.');
    }
  });

  it('rejeita quando o limite de vagas já foi atingido', async function () {
    global.InscricaoConcurso.count.resolves(2); // limiteParticipantes é 2

    try {
      await registrationCreate.fn.call(contexto, { concursoId: 1 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('Vagas Esgotadas');
    }
  });

  it('permite inscrever quando ainda há vaga', async function () {
    global.InscricaoConcurso.count.resolves(1); // 1 de 2 ocupada

    const resultado = await registrationCreate.fn.call(contexto, { concursoId: 1 });
    expect(resultado).to.deep.equal({ id: 42, status: 'inscrito' });
  });

  it('não checa limite de vagas quando o concurso não tem limiteParticipantes', async function () {
    concursoAberto.limiteParticipantes = null;

    const resultado = await registrationCreate.fn.call(contexto, { concursoId: 1 });
    expect(resultado).to.deep.equal({ id: 42, status: 'inscrito' });
    expect(global.InscricaoConcurso.count.called).to.be.false;
  });

  it('usa o id do usuário autenticado (this.req.usuario.id), nunca um valor vindo do input', async function () {
    await registrationCreate.fn.call(contexto, { concursoId: 1 });

    const dadosCriados = global.InscricaoConcurso.create.firstCall.args[0];
    expect(dadosCriados.usuario).to.equal(7);
  });
});