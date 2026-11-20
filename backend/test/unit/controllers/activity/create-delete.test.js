const { expect } = require('chai');
const sinon = require('sinon');
const activityCreate = require('../../../../api/controllers/activity/create');
const activityDelete = require('../../../../api/controllers/activity/delete');

const INICIO = new Date('2026-11-21T14:00:00-03:00').getTime();
const FIM = new Date('2026-11-21T15:00:00-03:00').getTime();

async function erroDe(promessa) {
  try {
    await promessa;
  } catch (erro) {
    return erro;
  }
  throw new Error('deveria ter lançado erro');
}

describe('activity/create (RF07)', function () {
  beforeEach(function () {
    global.Evento = { findOne: sinon.stub().resolves({ id: 3 }) };
    global.Atividade = {
      create: sinon.stub().callsFake((dados) => ({ fetch: sinon.stub().resolves({ id: 20, ...dados }) }))
    };
  });

  afterEach(function () {
    delete global.Evento;
    delete global.Atividade;
  });

  it('cadastra a atividade no evento informado', async function () {
    const dados = { titulo: 'Desfile Cosplay', dataHoraInicio: INICIO, dataHoraFim: FIM, evento: 3 };

    const criada = await activityCreate.fn(dados);

    expect(global.Evento.findOne.firstCall.args[0]).to.deep.equal({ id: 3 });
    expect(global.Atividade.create.firstCall.args[0]).to.deep.equal(dados);
    expect(criada).to.deep.equal({ id: 20, ...dados });
  });

  it('aceita atividade sem horário de término', async function () {
    await activityCreate.fn({ titulo: 'Karaokê', dataHoraInicio: INICIO, evento: 3 });

    expect(global.Atividade.create.calledOnce).to.be.true;
  });

  it('rejeita término antes do início', async function () {
    const erro = await erroDe(activityCreate.fn({ titulo: 'X', dataHoraInicio: FIM, dataHoraFim: INICIO, evento: 3 }));

    expect(erro.badRequest.message).to.equal('dataHoraFim não pode ser anterior a dataHoraInicio.');
    expect(global.Atividade.create.called).to.be.false;
  });

  it('rejeita evento que não existe', async function () {
    global.Evento.findOne.resolves(undefined);

    const erro = await erroDe(activityCreate.fn({ titulo: 'X', dataHoraInicio: INICIO, evento: 99 }));

    expect(erro.badRequest.message).to.equal('Evento informado não existe.');
    expect(global.Atividade.create.called).to.be.false;
  });
});

describe('activity/delete (RF07)', function () {
  beforeEach(function () {
    global.Atividade = {
      findOne: sinon.stub().resolves({ id: 20 }),
      destroyOne: sinon.stub().resolves({ id: 20 })
    };
  });

  afterEach(function () {
    delete global.Atividade;
  });

  it('remove a atividade e devolve o id removido', async function () {
    const resultado = await activityDelete.fn({ id: 20 });

    expect(global.Atividade.destroyOne.firstCall.args[0]).to.deep.equal({ id: 20 });
    expect(resultado).to.deep.equal({ id: 20 });
  });

  it('retorna notFound quando a atividade não existe', async function () {
    global.Atividade.findOne.resolves(undefined);

    const erro = await erroDe(activityDelete.fn({ id: 999 }));

    expect(erro).to.equal('notFound');
    expect(global.Atividade.destroyOne.called).to.be.false;
  });
});
