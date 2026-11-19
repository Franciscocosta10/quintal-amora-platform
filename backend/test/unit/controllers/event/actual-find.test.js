const { expect } = require('chai');
const sinon = require('sinon');
const actualFind = require('../../../../api/controllers/event/actual-find');

describe('event/actual-find', function () {
  let consulta;

  beforeEach(function () {
    consulta = { sort: sinon.stub(), limit: sinon.stub() };
    consulta.sort.returns(consulta);
    global.Evento = { find: sinon.stub().returns(consulta) };
  });

  afterEach(function () {
    delete global.Evento;
  });

  it('devolve o evento cadastrado mais recentemente', async function () {
    consulta.limit.resolves([{ id: 4, nome: 'Quintal da Amora 2026' }]);

    const evento = await actualFind.fn();

    expect(consulta.sort.firstCall.args[0]).to.equal('createdAt DESC');
    expect(consulta.limit.firstCall.args[0]).to.equal(1);
    expect(evento).to.deep.equal({ id: 4, nome: 'Quintal da Amora 2026' });
  });

  it('devolve null quando nenhum evento foi cadastrado', async function () {
    consulta.limit.resolves([]);

    expect(await actualFind.fn()).to.equal(null);
  });
});
