const { expect } = require('chai');
const sinon = require('sinon');
const expositorCreate = require('../../../../api/controllers/expositor/create');

describe('expositor/create', function () {
  let fetch;

  beforeEach(function () {
    fetch = sinon.stub().resolves({ id: 10 });
    global.Evento = { findOne: sinon.stub().resolves({ id: 1 }) };
    global.Expositor = { create: sinon.stub().returns({ fetch }) };
  });

  afterEach(function () {
    delete global.Evento;
    delete global.Expositor;
  });

  const inputsValidos = () => ({
    nome: 'Loja Geek',
    tipo: 'loja',
    descricao: 'Mangás, action figures e camisetas.',
    localizacaoEstande: 'Estande 12',
    imagem: 'https://cdn.exemplo.com/loja-geek.png',
    redesSociais: { instagram: 'https://instagram.com/lojageek' },
    evento: 1
  });

  it('cria o expositor quando os dados são válidos', async function () {
    const resultado = await expositorCreate.fn(inputsValidos());

    expect(resultado).to.deep.equal({ id: 10 });
    expect(global.Expositor.create.calledOnce).to.be.true;
    expect(fetch.calledOnce).to.be.true;
  });

  it('grava os dados normalizados (sem espaços extras e vazios como null)', async function () {
    const inputs = inputsValidos();
    inputs.nome = '  Loja Geek  ';
    inputs.descricao = '   ';
    inputs.redesSociais = { instagram: '', site: '' };

    await expositorCreate.fn(inputs);

    const dadosGravados = global.Expositor.create.firstCall.args[0];
    expect(dadosGravados.nome).to.equal('Loja Geek');
    expect(dadosGravados.descricao).to.equal(null);
    expect(dadosGravados.redesSociais).to.equal(null);
    expect(dadosGravados.evento).to.equal(1);
  });

  it('rejeita quando o evento informado não existe', async function () {
    global.Evento.findOne.resolves(undefined);

    try {
      await expositorCreate.fn(inputsValidos());
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('Evento informado não existe.');
    }

    expect(global.Expositor.create.called).to.be.false;
  });

  it('rejeita dados inválidos antes de consultar o banco', async function () {
    const inputs = inputsValidos();
    inputs.imagem = 'javascript:alert(1)';

    try {
      await expositorCreate.fn(inputs);
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('A imagem deve ser uma URL começando com http:// ou https://.');
    }

    expect(global.Evento.findOne.called).to.be.false;
    expect(global.Expositor.create.called).to.be.false;
  });
});
