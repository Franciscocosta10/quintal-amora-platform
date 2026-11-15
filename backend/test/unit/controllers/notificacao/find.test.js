const { expect } = require('chai');
const sinon = require('sinon');
const notificacaoFind = require('../../../../api/controllers/notificacao/find');

describe('notificacao/find', function () {
  let query;

  beforeEach(function () {
    query = {
      sort: sinon.stub().returnsThis(),
      limit: sinon.stub().resolves([{ id: 2, titulo: 'Novo' }, { id: 1, titulo: 'Antigo' }])
    };
    global.Notificacao = { find: sinon.stub().returns(query) };
  });

  afterEach(function () {
    delete global.Notificacao;
  });

  it('retorna os avisos do banco', async function () {
    const resultado = await notificacaoFind.fn();
    expect(resultado).to.deep.equal([{ id: 2, titulo: 'Novo' }, { id: 1, titulo: 'Antigo' }]);
  });

  it('ordena do mais novo para o mais antigo e limita a 20', async function () {
    await notificacaoFind.fn();

    expect(query.sort.firstCall.args[0]).to.equal('createdAt DESC');
    expect(query.limit.firstCall.args[0]).to.equal(20);
  });

  it('não devolve o autor do aviso', async function () {
    await notificacaoFind.fn();

    const { select } = global.Notificacao.find.firstCall.args[0];
    expect(select).to.not.include('autor');
  });
});
