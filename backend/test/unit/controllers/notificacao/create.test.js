const { expect } = require('chai');
const sinon = require('sinon');
const notificacaoCreate = require('../../../../api/controllers/notificacao/create');

// Query encadeável do Waterline (.sort().limit()) que resolve no fim.
function queryFalsa(resultado) {
  return {
    sort: sinon.stub().returnsThis(),
    limit: sinon.stub().resolves(resultado)
  };
}

describe('notificacao/create', function () {
  let contexto;
  let exits;

  beforeEach(function () {
    global.Evento = { find: sinon.stub().returns(queryFalsa([{ id: 3 }])) };
    global.Notificacao = {
      create: sinon.stub().returns({ fetch: sinon.stub().resolves({ id: 10, titulo: 'Aviso' }) })
    };

    contexto = { req: { usuario: { id: 7 } } };
    exits = { success: sinon.stub(), dadosInvalidos: sinon.stub() };
  });

  afterEach(function () {
    delete global.Evento;
    delete global.Notificacao;
  });

  it('cria o aviso com o admin como autor e o evento atual', async function () {
    await notificacaoCreate.fn.call(
      contexto,
      { titulo: 'Atraso', mensagem: 'O show começa 15h.', tipo: 'alteracao_programacao' },
      exits
    );

    expect(global.Notificacao.create.firstCall.args[0]).to.deep.equal({
      titulo: 'Atraso',
      mensagem: 'O show começa 15h.',
      tipo: 'alteracao_programacao',
      autor: 7,
      evento: 3
    });
    expect(exits.success.firstCall.args[0]).to.deep.equal({ id: 10, titulo: 'Aviso' });
  });

  it('remove espaços das pontas do título e da mensagem', async function () {
    await notificacaoCreate.fn.call(
      contexto,
      { titulo: '  Atraso  ', mensagem: '  Texto  ', tipo: 'aviso_geral' },
      exits
    );

    const dados = global.Notificacao.create.firstCall.args[0];
    expect(dados.titulo).to.equal('Atraso');
    expect(dados.mensagem).to.equal('Texto');
  });

  it('recusa título ou mensagem só com espaços', async function () {
    await notificacaoCreate.fn.call(contexto, { titulo: '   ', mensagem: 'Texto', tipo: 'aviso_geral' }, exits);
    await notificacaoCreate.fn.call(contexto, { titulo: 'Título', mensagem: '  ', tipo: 'aviso_geral' }, exits);

    expect(exits.dadosInvalidos.callCount).to.equal(2);
    expect(global.Notificacao.create.called).to.equal(false);
  });

  it('cria sem evento quando nenhum evento foi cadastrado', async function () {
    global.Evento.find.returns(queryFalsa([]));

    await notificacaoCreate.fn.call(contexto, { titulo: 'Oi', mensagem: 'Texto', tipo: 'aviso_geral' }, exits);

    expect(global.Notificacao.create.firstCall.args[0].evento).to.equal(null);
  });
});
