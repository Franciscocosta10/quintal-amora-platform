const { expect } = require('chai');
const sinon = require('sinon');
const contestUpdate = require('../../../../api/controllers/contest/update');

describe('contest/update', function () {
  let concursoExistente;

  beforeEach(function () {
    global._ = require('@sailshq/lodash');

    concursoExistente = {
      id: 1,
      dataHoraInicio: new Date('2026-11-20T14:00:00-03:00').getTime(),
      dataHoraFim: new Date('2026-11-20T16:00:00-03:00').getTime(),
      inicioInscricao: new Date('2026-11-10T00:00:00-03:00').getTime(),
      fimInscricao: new Date('2026-11-15T23:59:59-03:00').getTime()
    };

    global.Concurso = {
      findOne: sinon.stub().resolves(concursoExistente),
      updateOne: sinon.stub().returns({ set: sinon.stub().resolves({ id: 1 }) })
    };

    global.Notificacao = { create: sinon.stub().resolves() };
  });

  afterEach(function () {
    delete global.Concurso;
    delete global.Notificacao;
    delete global._;
  });

  it('atualiza quando os dados (parciais) continuam válidos', async function () {
    const resultado = await contestUpdate.fn({ id: 1, nome: 'Novo nome' });
    expect(resultado).to.deep.equal({ id: 1 });
  });

  it('retorna notFound quando o concurso não existe', async function () {
    global.Concurso.findOne.resolves(undefined);

    try {
      await contestUpdate.fn({ id: 999, nome: 'X' });
      throw new Error('deveria ter lançado notFound');
    } catch (erro) {
      expect(erro).to.equal('notFound');
    }
  });

  it('rejeita quando o novo horário de término fica antes/igual ao início', async function () {
    try {
      await contestUpdate.fn({ id: 1, dataHoraFim: concursoExistente.dataHoraInicio - 1000 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('O horário de término deve ser depois do horário de início.');
    }
  });

  it('rejeita quando o novo início de inscrição fica depois do término existente', async function () {
    try {
      await contestUpdate.fn({ id: 1, inicioInscricao: concursoExistente.fimInscricao + 1000 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('O início das inscrições não pode ser depois do término.');
    }
  });

  it('rejeita quando o novo fim de inscrição fica depois do início do concurso', async function () {
    try {
      await contestUpdate.fn({ id: 1, fimInscricao: concursoExistente.dataHoraInicio + 1000 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('As inscrições precisam encerrar antes do início do concurso.');
    }
  });

  it('usa o novo dataHoraInicio quando ele é informado na edição', async function () {
  const novoInicio = concursoExistente.dataHoraInicio + 60 * 60 * 1000; // 1h depois

  await contestUpdate.fn.call({ req: { usuario: { id: 7 } } }, { id: 1, dataHoraInicio: novoInicio });

  const camposEnviados = global.Concurso.updateOne().set.firstCall.args[0];
  expect(camposEnviados.dataHoraInicio).to.equal(novoInicio);
});

  it('avisa os participantes quando o horário do concurso muda (RF09)', async function () {
    const novoInicio = new Date('2026-11-20T15:00:00-03:00').getTime();
    global.Concurso.updateOne.returns({
      set: sinon.stub().resolves({ id: 1, nome: 'Concurso Cosplay', dataHoraInicio: novoInicio, evento: 3 })
    });

    await contestUpdate.fn.call({ req: { usuario: { id: 7 } } }, { id: 1, dataHoraInicio: novoInicio });

    expect(global.Notificacao.create.firstCall.args[0]).to.deep.equal({
      titulo: 'Mudança de horário: Concurso Cosplay',
      mensagem: 'Concurso Cosplay agora começa em 20/11 às 15:00.',
      tipo: 'chamada_concurso',
      autor: 7,
      concurso: 1,
      evento: 3
    });
  });

  it('não avisa ninguém quando a edição não muda o horário', async function () {
    await contestUpdate.fn({ id: 1, nome: 'Novo nome', dataHoraInicio: concursoExistente.dataHoraInicio });

    expect(global.Notificacao.create.called).to.equal(false);
  });

  it('permite editar um concurso cuja data já passou (não revalida "no passado" no update)', async function () {
  concursoExistente.inicioInscricao = new Date('2019-12-20T00:00:00-03:00').getTime();
  concursoExistente.fimInscricao = new Date('2019-12-30T23:59:59-03:00').getTime();
  concursoExistente.dataHoraInicio = new Date('2020-01-01T10:00:00-03:00').getTime();
  concursoExistente.dataHoraFim = new Date('2020-01-01T12:00:00-03:00').getTime();

  const resultado = await contestUpdate.fn({ id: 1, descricao: 'Atualizando concurso antigo' });
  expect(resultado).to.deep.equal({ id: 1 });
});
});