const { expect } = require('chai');
const sinon = require('sinon');
const checkinCreate = require('../../../../api/controllers/checkin/create');
const criarExits = require('../../support/exits');

describe('checkin/create (RF04 e RF05)', function () {
  let exits;
  let contexto;

  beforeEach(function () {
    exits = criarExits('qrInvalido', 'eventoNaoEncontrado', 'jaFezCheckin');
    contexto = { req: { usuario: { id: 7 } } };
    global.Evento = { findOne: sinon.stub().resolves({ id: 3 }) };
    global.Checkin = {
      findOne: sinon.stub().resolves(undefined),
      create: sinon.stub().callsFake((dados) => ({ fetch: sinon.stub().resolves({ id: 50, ...dados }) }))
    };
  });

  afterEach(function () {
    delete global.Evento;
    delete global.Checkin;
  });

  it('registra a entrada com o horário automático e o ponto do QR', async function () {
    const antes = Date.now();

    await checkinCreate.fn.call(contexto, { qrCode: 'checkin:evento:3:ponto:Entrada Principal' }, exits);

    const dados = global.Checkin.create.firstCall.args[0];
    expect(dados).to.include({
      usuario: 7,
      evento: 3,
      pontoDeEntrada: 'Entrada Principal',
      codigoQrUtilizado: 'checkin:evento:3:ponto:Entrada Principal'
    });
    expect(dados.dataHoraEntrada).to.be.at.least(antes);
    expect(exits.success.firstCall.args[0].checkin).to.include({ id: 50, evento: 3 });
  });

  it('aceita QR sem ponto de entrada', async function () {
    await checkinCreate.fn.call(contexto, { qrCode: 'checkin:evento:3' }, exits);

    expect(global.Checkin.create.firstCall.args[0].pontoDeEntrada).to.equal(null);
    expect(exits.success.calledOnce).to.be.true;
  });

  it('recusa QR que não é de check-in', async function () {
    await checkinCreate.fn.call(contexto, { qrCode: 'https://site-qualquer.com' }, exits);

    expect(exits.qrInvalido.firstCall.args[0]).to.deep.equal({ message: 'QR Code inválido para check-in.' });
    expect(global.Evento.findOne.called).to.be.false;
  });

  it('recusa QR de evento que não existe', async function () {
    global.Evento.findOne.resolves(undefined);

    await checkinCreate.fn.call(contexto, { qrCode: 'checkin:evento:99' }, exits);

    expect(global.Evento.findOne.firstCall.args[0]).to.deep.equal({ id: 99 });
    expect(exits.eventoNaoEncontrado.firstCall.args[0]).to.deep.equal({ message: 'Evento não encontrado.' });
  });

  it('não registra duas vezes no mesmo evento e devolve o check-in que já existe', async function () {
    const existente = { id: 12, usuario: 7, evento: 3 };
    global.Checkin.findOne.resolves(existente);

    await checkinCreate.fn.call(contexto, { qrCode: 'checkin:evento:3' }, exits);

    expect(global.Checkin.findOne.firstCall.args[0]).to.deep.equal({ usuario: 7, evento: 3 });
    expect(exits.jaFezCheckin.firstCall.args[0]).to.deep.equal({
      checkin: existente,
      message: 'Você já realizou o check-in neste evento.'
    });
    expect(global.Checkin.create.called).to.be.false;
  });
});
