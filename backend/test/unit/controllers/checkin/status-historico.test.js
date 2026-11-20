const { expect } = require('chai');
const sinon = require('sinon');
const checkinStatus = require('../../../../api/controllers/checkin/status');
const checkinHistorico = require('../../../../api/controllers/checkin/historico');
const criarExits = require('../../support/exits');

const contexto = { req: { usuario: { id: 7 } } };

describe('checkin/status', function () {
  beforeEach(function () {
    global.Checkin = { findOne: sinon.stub() };
  });

  afterEach(function () {
    delete global.Checkin;
  });

  it('informa o check-in do usuário logado no evento', async function () {
    const checkin = { id: 12, evento: 3 };
    global.Checkin.findOne.resolves(checkin);
    const exits = criarExits();

    await checkinStatus.fn.call(contexto, { eventoId: 3 }, exits);

    expect(global.Checkin.findOne.firstCall.args[0]).to.deep.equal({ usuario: 7, evento: 3 });
    expect(exits.success.firstCall.args[0]).to.deep.equal({ fezCheckin: true, checkin });
  });

  it('informa quando ainda não fez check-in', async function () {
    global.Checkin.findOne.resolves(undefined);
    const exits = criarExits();

    await checkinStatus.fn.call(contexto, { eventoId: 3 }, exits);

    expect(exits.success.firstCall.args[0]).to.deep.equal({ fezCheckin: false, checkin: null });
  });
});

describe('checkin/historico', function () {
  let consulta;

  beforeEach(function () {
    const checkins = [{ id: 2, evento: { id: 3, nome: 'Quintal da Amora' } }];
    consulta = { populate: sinon.stub(), sort: sinon.stub().resolves(checkins) };
    consulta.populate.returns(consulta);
    global.Checkin = { find: sinon.stub().returns(consulta) };
  });

  afterEach(function () {
    delete global.Checkin;
  });

  it('lista só os check-ins do usuário logado, com o evento, do mais recente ao mais antigo', async function () {
    const exits = criarExits();

    await checkinHistorico.fn.call(contexto, {}, exits);

    expect(global.Checkin.find.firstCall.args[0]).to.deep.equal({ usuario: 7 });
    expect(consulta.populate.firstCall.args[0]).to.equal('evento');
    expect(consulta.sort.firstCall.args[0]).to.equal('dataHoraEntrada DESC');
    expect(exits.success.firstCall.args[0]).to.deep.equal({
      checkins: [{ id: 2, evento: { id: 3, nome: 'Quintal da Amora' } }]
    });
  });
});
