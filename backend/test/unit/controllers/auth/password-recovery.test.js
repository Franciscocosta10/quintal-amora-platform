const { expect } = require('chai');
const sinon = require('sinon');
const crypto = require('crypto');
const forgotPassword = require('../../../../api/controllers/auth/forgot-password');
const resetPassword = require('../../../../api/controllers/auth/reset-password');
const criarExits = require('../../support/exits');

const MENSAGEM_GENERICA = { message: 'Recuperação de senha iniciada com sucesso.' };

function sha256(texto) {
  return crypto.createHash('sha256').update(texto).digest('hex');
}

describe('auth/forgot-password', function () {
  let exits;
  let set;
  let enviarEmail;

  beforeEach(function () {
    exits = criarExits();
    set = sinon.stub().resolves();
    enviarEmail = sinon.stub().resolves();
    global.Usuario = {
      findOne: sinon.stub().resolves({ id: 7, email: 'ana@email.com', nomeCompleto: 'Ana Souza' }),
      updateOne: sinon.stub().returns({ set })
    };
    global.sails = {
      config: { custom: { frontendUrl: 'https://quintal.exemplo' } },
      helpers: { sendPasswordResetEmail: { with: enviarEmail } },
      log: { info: sinon.stub(), error: sinon.stub() }
    };
  });

  afterEach(function () {
    delete global.Usuario;
    delete global.sails;
  });

  it('guarda só o hash do token, com validade de 30 minutos', async function () {
    const agora = Date.now();

    await forgotPassword.fn({ email: ' ANA@Email.com ' }, exits);

    expect(global.Usuario.findOne.firstCall.args[0]).to.deep.equal({ email: 'ana@email.com' });
    expect(global.Usuario.updateOne.firstCall.args[0]).to.deep.equal({ id: 7 });

    const gravado = set.firstCall.args[0];
    const tokenDoLink = enviarEmail.firstCall.args[0].link.split('token=')[1];
    expect(gravado.resetPasswordToken).to.equal(sha256(tokenDoLink));
    expect(gravado.resetPasswordToken).to.not.equal(tokenDoLink);
    expect(gravado.resetPasswordExpiresAt - agora).to.be.within(30 * 60 * 1000 - 1000, 30 * 60 * 1000 + 1000);
  });

  it('envia o link do frontend para o e-mail do usuário, com o nome dele', async function () {
    await forgotPassword.fn({ email: 'ana@email.com' }, exits);

    const email = enviarEmail.firstCall.args[0];
    expect(email.destinatario).to.equal('ana@email.com');
    expect(email.nome).to.equal('Ana Souza');
    expect(email.link).to.match(/^https:\/\/quintal\.exemplo\/redefinir-senha\?token=[0-9a-f]{64}$/);
    expect(exits.success.firstCall.args[0]).to.deep.equal(MENSAGEM_GENERICA);
  });

  it('responde igual para e-mail sem conta, sem gravar nem enviar nada', async function () {
    global.Usuario.findOne.resolves(undefined);

    await forgotPassword.fn({ email: 'ninguem@email.com' }, exits);

    expect(exits.success.firstCall.args[0]).to.deep.equal(MENSAGEM_GENERICA);
    expect(global.Usuario.updateOne.called).to.be.false;
    expect(enviarEmail.called).to.be.false;
  });

  it('não repassa ao cliente uma falha no envio do e-mail', async function () {
    enviarEmail.rejects(new Error('SMTP fora do ar'));

    await forgotPassword.fn({ email: 'ana@email.com' }, exits);

    expect(global.sails.log.error.calledOnce).to.be.true;
    expect(exits.success.firstCall.args[0]).to.deep.equal(MENSAGEM_GENERICA);
  });
});

describe('auth/reset-password', function () {
  let exits;
  let set;

  beforeEach(function () {
    exits = criarExits('tokenInvalido');
    set = sinon.stub().resolves();
    global.Usuario = {
      findOne: sinon.stub().resolves({ id: 7, resetPasswordExpiresAt: Date.now() + 60 * 1000 }),
      updateOne: sinon.stub().returns({ set })
    };
    global.sails = { log: { info: sinon.stub() } };
  });

  afterEach(function () {
    delete global.Usuario;
    delete global.sails;
  });

  it('procura o usuário pelo hash do token recebido', async function () {
    await resetPassword.fn({ token: 'abc123', novaSenha: 'novaSenha1' }, exits);

    expect(global.Usuario.findOne.firstCall.args[0]).to.deep.equal({ resetPasswordToken: sha256('abc123') });
  });

  it('troca a senha e invalida o token para não ser usado de novo', async function () {
    await resetPassword.fn({ token: 'abc123', novaSenha: 'novaSenha1' }, exits);

    expect(global.Usuario.updateOne.firstCall.args[0]).to.deep.equal({ id: 7 });
    expect(set.firstCall.args[0]).to.deep.equal({ senha: 'novaSenha1', resetPasswordToken: null, resetPasswordExpiresAt: null });
    expect(exits.success.firstCall.args[0]).to.deep.equal({ message: 'Senha redefinida com sucesso.' });
  });

  it('recusa token que não existe', async function () {
    global.Usuario.findOne.resolves(undefined);

    await resetPassword.fn({ token: 'abc123', novaSenha: 'novaSenha1' }, exits);

    expect(exits.tokenInvalido.calledOnce).to.be.true;
    expect(global.Usuario.updateOne.called).to.be.false;
  });

  it('recusa token expirado', async function () {
    global.Usuario.findOne.resolves({ id: 7, resetPasswordExpiresAt: Date.now() - 1 });

    await resetPassword.fn({ token: 'abc123', novaSenha: 'novaSenha1' }, exits);

    expect(exits.tokenInvalido.calledOnce).to.be.true;
    expect(global.Usuario.updateOne.called).to.be.false;
  });

  it('recusa token sem data de validade', async function () {
    global.Usuario.findOne.resolves({ id: 7, resetPasswordExpiresAt: null });

    await resetPassword.fn({ token: 'abc123', novaSenha: 'novaSenha1' }, exits);

    expect(exits.tokenInvalido.calledOnce).to.be.true;
  });
});
