const { expect } = require('chai');
const sinon = require('sinon');
const expositorUpdate = require('../../../../api/controllers/expositor/update');

describe('expositor/update', function () {
  let set;

  beforeEach(function () {
    global._ = require('@sailshq/lodash');

    set = sinon.stub().resolves({ id: 5, nome: 'Editado' });
    global.Expositor = {
      findOne: sinon.stub().resolves({ id: 5, nome: 'Original', tipo: 'loja' }),
      updateOne: sinon.stub().returns({ set })
    };
  });

  afterEach(function () {
    delete global.Expositor;
    delete global._;
  });

  it('atualiza apenas os campos enviados, sem incluir o id no set', async function () {
    const resultado = await expositorUpdate.fn({ id: 5, nome: '  Editado ', tipo: 'artista' });

    expect(resultado).to.deep.equal({ id: 5, nome: 'Editado' });
    expect(global.Expositor.updateOne.firstCall.args[0]).to.deep.equal({ id: 5 });
    expect(set.firstCall.args[0]).to.deep.equal({ nome: 'Editado', tipo: 'artista' });
  });

  it('permite limpar campos opcionais enviando null', async function () {
    await expositorUpdate.fn({ id: 5, descricao: null, redesSociais: null });

    expect(set.firstCall.args[0]).to.deep.equal({ descricao: null, redesSociais: null });
  });

  it('lança notFound quando o expositor não existe', async function () {
    global.Expositor.findOne.resolves(undefined);

    try {
      await expositorUpdate.fn({ id: 999, nome: 'X' });
      throw new Error('deveria ter lançado notFound');
    } catch (erro) {
      expect(erro).to.equal('notFound');
    }

    expect(global.Expositor.updateOne.called).to.be.false;
  });

  it('rejeita dados inválidos sem atualizar', async function () {
    try {
      await expositorUpdate.fn({ id: 5, redesSociais: { site: 'ftp://loja.com' } });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('O link de site deve ser uma URL começando com http:// ou https://.');
    }

    expect(global.Expositor.updateOne.called).to.be.false;
  });
});
