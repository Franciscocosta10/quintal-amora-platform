const { expect } = require('chai');
const sinon = require('sinon');
const updateProfile = require('../../../../api/controllers/auth/update-profile');

const contexto = { req: { usuario: { id: 7 } } };

async function erroDe(inputs) {
  try {
    await updateProfile.fn.call(contexto, inputs);
  } catch (erro) {
    return erro;
  }
  throw new Error('deveria ter lançado erro');
}

describe('auth/update-profile', function () {
  let set;

  beforeEach(function () {
    global._ = require('@sailshq/lodash');
    set = sinon.stub().resolves({ id: 7, nomeCompleto: 'Ana Souza', email: 'ana@email.com', senha: 'hash' });
    global.Usuario = {
      findOne: sinon.stub().resolves(undefined),
      updateOne: sinon.stub().returns({ set })
    };
  });

  afterEach(function () {
    delete global._;
    delete global.Usuario;
  });

  it('grava nome e e-mail normalizados do próprio usuário e não devolve a senha', async function () {
    const resultado = await updateProfile.fn.call(contexto, { nomeCompleto: '  Ana Souza ', email: ' ANA@Email.com ' });

    expect(global.Usuario.findOne.firstCall.args[0]).to.deep.equal({ email: 'ana@email.com' });
    expect(global.Usuario.updateOne.firstCall.args[0]).to.deep.equal({ id: 7 });
    expect(set.firstCall.args[0]).to.deep.equal({ nomeCompleto: 'Ana Souza', email: 'ana@email.com' });
    expect(resultado).to.deep.equal({ id: 7, nomeCompleto: 'Ana Souza', email: 'ana@email.com' });
  });

  it('aceita manter o próprio e-mail', async function () {
    global.Usuario.findOne.resolves({ id: 7 });

    await updateProfile.fn.call(contexto, { nomeCompleto: 'Ana', email: 'ana@email.com' });

    expect(set.calledOnce).to.be.true;
  });

  it('recusa e-mail de outra conta', async function () {
    global.Usuario.findOne.resolves({ id: 99 });

    const erro = await erroDe({ nomeCompleto: 'Ana', email: 'outra@email.com' });

    expect(erro.emailJaCadastrado.message).to.equal('Este e-mail já está sendo usado por outra conta.');
    expect(global.Usuario.updateOne.called).to.be.false;
  });

  it('recusa nome só com espaços', async function () {
    const erro = await erroDe({ nomeCompleto: '   ', email: 'ana@email.com' });

    expect(erro.badRequest.message).to.equal('Informe seu nome.');
    expect(global.Usuario.findOne.called).to.be.false;
  });
});
