const { expect } = require('chai');
const sinon = require('sinon');
const contestCreate = require('../../../../api/controllers/contest/create');

describe('contest/create', function () {
  let relogio;

  beforeEach(function () {
    // Congela "agora" para evitar que os testes de "data no passado"
    // dependam do dia real em que rodam.
    relogio = sinon.useFakeTimers(new Date('2026-11-10T12:00:00-03:00').getTime());

    global.Evento = { findOne: sinon.stub().resolves({ id: 1 }) };
    global.Concurso = { create: sinon.stub().returns({ fetch: sinon.stub().resolves({ id: 99 }) }) };
  });

  afterEach(function () {
    relogio.restore();
    delete global.Evento;
    delete global.Concurso;
  });

  const inputsValidos = () => ({
    nome: 'Concurso de Cosplay',
    categoria: 'cosplay',
    dataHoraInicio: new Date('2026-11-20T14:00:00-03:00').getTime(),
    dataHoraFim: new Date('2026-11-20T16:00:00-03:00').getTime(),
    limiteParticipantes: 10,
    inicioInscricao: new Date('2026-11-10T00:00:00-03:00').getTime(),
    fimInscricao: new Date('2026-11-15T23:59:59-03:00').getTime(),
    evento: 1
  });

  it('cria o concurso quando todos os dados são válidos', async function () {
    const resultado = await contestCreate.fn(inputsValidos());
    expect(resultado).to.deep.equal({ id: 99 });
    expect(global.Concurso.create.calledOnce).to.be.true;
  });

  it('rejeita quando a data do concurso é no passado', async function () {
    const inputs = inputsValidos();
    inputs.dataHoraInicio = new Date('2026-11-01T14:00:00-03:00').getTime();

    try {
      await contestCreate.fn(inputs);
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('A data do concurso não pode ser no passado.');
    }
  });

  it('permite data do concurso no mesmo dia de hoje', async function () {
    const inputs = inputsValidos();
    inputs.dataHoraInicio = new Date('2026-11-10T18:00:00-03:00').getTime();
    inputs.dataHoraFim = new Date('2026-11-10T20:00:00-03:00').getTime();
    inputs.fimInscricao = new Date('2026-11-10T17:00:00-03:00').getTime();

    const resultado = await contestCreate.fn(inputs);
    expect(resultado).to.deep.equal({ id: 99 });
  });

  it('rejeita quando o horário de término é antes ou igual ao de início', async function () {
    const inputs = inputsValidos();
    inputs.dataHoraFim = inputs.dataHoraInicio;

    try {
      await contestCreate.fn(inputs);
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('O horário de término deve ser depois do horário de início.');
    }
  });

  it('rejeita quando o início das inscrições é depois do término', async function () {
    const inputs = inputsValidos();
    const temp = inputs.inicioInscricao;
    inputs.inicioInscricao = inputs.fimInscricao;
    inputs.fimInscricao = temp;

    try {
      await contestCreate.fn(inputs);
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('O início das inscrições não pode ser depois do término.');
    }
  });

  it('rejeita quando as inscrições terminam depois do início do concurso', async function () {
    const inputs = inputsValidos();
    inputs.fimInscricao = inputs.dataHoraInicio + 1000;

    try {
      await contestCreate.fn(inputs);
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('As inscrições precisam encerrar antes do início do concurso.');
    }
  });

  it('rejeita limite de participantes menor ou igual a zero', async function () {
    const inputs = inputsValidos();
    inputs.limiteParticipantes = 0;

    try {
      await contestCreate.fn(inputs);
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('limiteParticipantes deve ser maior que zero.');
    }
  });

  it('permite limiteParticipantes ausente (sem limite)', async function () {
    const inputs = inputsValidos();
    delete inputs.limiteParticipantes;

    const resultado = await contestCreate.fn(inputs);
    expect(resultado).to.deep.equal({ id: 99 });
  });

  it('rejeita quando o evento informado não existe', async function () {
    global.Evento.findOne.resolves(undefined);

    try {
      await contestCreate.fn(inputsValidos());
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('Evento informado não existe.');
    }
  });
});