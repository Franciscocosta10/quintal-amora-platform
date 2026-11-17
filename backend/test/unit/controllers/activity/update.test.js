const { expect } = require('chai');
const sinon = require('sinon');
const activityUpdate = require('../../../../api/controllers/activity/update');

const INICIO = new Date('2026-11-21T14:00:00-03:00').getTime();
const FIM = new Date('2026-11-21T15:00:00-03:00').getTime();

describe('activity/update', function () {
  let contexto;

  beforeEach(function () {
    global._ = require('@sailshq/lodash');

    global.Atividade = {
      findOne: sinon.stub().resolves({ id: 5, dataHoraInicio: INICIO, dataHoraFim: FIM }),
      updateOne: sinon.stub().returns({
        set: sinon.stub().callsFake((campos) => Promise.resolve(
          Object.assign({ id: 5, titulo: 'Show de K-pop', evento: 3, dataHoraInicio: INICIO, dataHoraFim: FIM }, campos)
        ))
      })
    };

    global.Notificacao = { create: sinon.stub().resolves() };

    contexto = { req: { usuario: { id: 1 } } };
  });

  afterEach(function () {
    delete global.Atividade;
    delete global.Notificacao;
    delete global._;
  });

  it('retorna notFound quando a atividade não existe', async function () {
    global.Atividade.findOne.resolves(undefined);

    try {
      await activityUpdate.fn.call(contexto, { id: 999, titulo: 'X' });
      throw new Error('deveria ter lançado notFound');
    } catch (erro) {
      expect(erro).to.equal('notFound');
    }
  });

  it('rejeita término antes do início', async function () {
    try {
      await activityUpdate.fn.call(contexto, { id: 5, dataHoraFim: INICIO - 1000 });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('dataHoraFim não pode ser anterior a dataHoraInicio.');
    }
  });

  it('avisa os participantes quando o horário muda (RF09)', async function () {
    const novoInicio = new Date('2026-11-21T16:00:00-03:00').getTime();
    const novoFim = new Date('2026-11-21T17:00:00-03:00').getTime();

    const resultado = await activityUpdate.fn.call(contexto, { id: 5, dataHoraInicio: novoInicio, dataHoraFim: novoFim });

    expect(resultado.dataHoraInicio).to.equal(novoInicio);
    expect(global.Notificacao.create.firstCall.args[0]).to.deep.equal({
      titulo: 'Mudança de horário: Show de K-pop',
      mensagem: 'Show de K-pop agora começa em 21/11 às 16:00.',
      tipo: 'alteracao_programacao',
      autor: 1,
      atividade: 5,
      evento: 3
    });
  });

  it('não avisa ninguém quando só o título muda', async function () {
    await activityUpdate.fn.call(contexto, { id: 5, titulo: 'Show de J-pop', dataHoraInicio: INICIO });

    expect(global.Notificacao.create.called).to.equal(false);
  });
});
