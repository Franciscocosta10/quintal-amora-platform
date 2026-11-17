const { expect } = require('chai');
const sinon = require('sinon');
const eventSave = require('../../../../api/controllers/event/save');

// Query encadeável do Waterline (.sort().limit()) que resolve no fim.
function queryFalsa(resultado) {
  return {
    sort: sinon.stub().returnsThis(),
    limit: sinon.stub().resolves(resultado)
  };
}

const INICIO = new Date('2026-11-21T10:00:00-03:00').getTime();
const FIM = new Date('2026-11-22T20:00:00-03:00').getTime();

function dadosValidos(extra) {
  return Object.assign({
    nome: 'Quintal da Amora',
    edicao: 15,
    localizacao: 'Expoville, Joinville',
    dataHoraInicio: INICIO,
    dataHoraFim: FIM
  }, extra);
}

describe('event/save', function () {
  let exits;
  let set;

  beforeEach(function () {
    set = sinon.stub().resolves({ id: 3, nome: 'Quintal da Amora' });
    global.Evento = {
      find: sinon.stub().returns(queryFalsa([])),
      create: sinon.stub().returns({ fetch: sinon.stub().resolves({ id: 9, nome: 'Quintal da Amora' }) }),
      updateOne: sinon.stub().returns({ set: set })
    };
    exits = { success: sinon.stub(), dadosInvalidos: sinon.stub() };
  });

  afterEach(function () {
    delete global.Evento;
  });

  it('cria o evento quando ainda não existe nenhum', async function () {
    await eventSave.fn(dadosValidos(), exits);

    expect(global.Evento.create.calledOnce).to.equal(true);
    expect(global.Evento.create.firstCall.args[0].localizacao).to.equal('Expoville, Joinville');
    expect(global.Evento.updateOne.called).to.equal(false);
    expect(exits.success.firstCall.args[0]).to.deep.equal({ id: 9, nome: 'Quintal da Amora' });
  });

  it('edita o evento atual quando ele já existe', async function () {
    global.Evento.find.returns(queryFalsa([{ id: 3 }]));

    await eventSave.fn(dadosValidos({ nome: '  Quintal da Amora  ' }), exits);

    expect(global.Evento.updateOne.firstCall.args[0]).to.deep.equal({ id: 3 });
    expect(set.firstCall.args[0].nome).to.equal('Quintal da Amora');
    expect(global.Evento.create.called).to.equal(false);
    expect(exits.success.calledOnce).to.equal(true);
  });

  it('rejeita nome só com espaços', async function () {
    await eventSave.fn(dadosValidos({ nome: '   ' }), exits);

    expect(exits.dadosInvalidos.firstCall.args[0].message).to.equal('Informe o nome do evento.');
    expect(global.Evento.create.called).to.equal(false);
  });

  it('rejeita término antes ou igual ao início', async function () {
    await eventSave.fn(dadosValidos({ dataHoraFim: INICIO }), exits);

    expect(exits.dadosInvalidos.firstCall.args[0].message)
      .to.equal('O término do evento deve ser depois do início.');
    expect(global.Evento.find.called).to.equal(false);
  });
});
