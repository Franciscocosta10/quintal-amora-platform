const { expect } = require('chai');
const sinon = require('sinon');
const expositorFind = require('../../../../api/controllers/expositor/find');

describe('expositor/find', function () {
  const expositoresFalsos = [
    { id: 1, nome: 'Ateliê Sakura', tipo: 'artista' },
    { id: 2, nome: 'Loja Geek', tipo: 'loja' }
  ];

  beforeEach(function () {
    global.Expositor = {
      find: sinon.stub().returns({ sort: sinon.stub().resolves(expositoresFalsos) }),
      findOne: sinon.stub().resolves({ id: 2, nome: 'Loja Geek', tipo: 'loja' })
    };
  });

  afterEach(function () {
    delete global.Expositor;
  });

  describe('listagem (RF13)', function () {
    it('retorna todos os expositores ordenados por nome quando não há filtros', async function () {
      const resultado = await expositorFind.fn({});

      expect(resultado).to.deep.equal(expositoresFalsos);
      expect(global.Expositor.find.firstCall.args[0]).to.deep.equal({});

      const sort = global.Expositor.find.firstCall.returnValue.sort;
      expect(sort.firstCall.args[0]).to.equal('nome ASC');
    });

    it('aplica os filtros de eventoId e tipo na query', async function () {
      await expositorFind.fn({ eventoId: 1, tipo: 'loja' });

      expect(global.Expositor.find.firstCall.args[0]).to.deep.equal({ evento: 1, tipo: 'loja' });
    });

    it('não consulta findOne quando não há id', async function () {
      await expositorFind.fn({});
      expect(global.Expositor.findOne.called).to.be.false;
    });
  });

  describe('detalhe (RF14)', function () {
    it('retorna um único expositor quando o id é informado', async function () {
      const resultado = await expositorFind.fn({ id: 2 });

      expect(resultado).to.deep.equal({ id: 2, nome: 'Loja Geek', tipo: 'loja' });
      expect(global.Expositor.findOne.firstCall.args[0]).to.deep.equal({ id: 2 });
      expect(global.Expositor.find.called).to.be.false;
    });

    it('lança notFound quando o expositor não existe', async function () {
      global.Expositor.findOne.resolves(undefined);

      try {
        await expositorFind.fn({ id: 999 });
        throw new Error('deveria ter lançado notFound');
      } catch (erro) {
        expect(erro).to.equal('notFound');
      }
    });
  });
});
