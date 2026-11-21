const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const login = require('../../../../api/controllers/auth/login');
const limiteLogin = require('../../../../api/utils/limiteLogin');
const criarExits = require('../../support/exits');

describe('auth/login', function () {
  let exits;
  let hashDaSenha;

  before(async function () {
    hashDaSenha = await bcrypt.hash('senha-correta', 4);
  });

  beforeEach(function () {
    limiteLogin.zerarTudo();
    global._ = require('@sailshq/lodash');
    exits = criarExits('credenciaisInvalidas', 'muitasTentativas');
    global.Usuario = {
      findOne: sinon.stub().resolves({ id: 7, email: 'ana@email.com', senha: hashDaSenha, perfil: 'visitante', ativo: true })
    };
    global.sails = { helpers: { jwt: { signToken: sinon.stub().resolves('token-jwt') } } };
  });

  afterEach(function () {
    delete global._;
    delete global.Usuario;
    delete global.sails;
  });

  it('busca pelo e-mail normalizado e devolve o usuário sem a senha e o token', async function () {
    await login.fn({ email: ' ANA@Email.com ', senha: 'senha-correta' }, exits);

    expect(global.Usuario.findOne.firstCall.args[0]).to.deep.equal({ email: 'ana@email.com' });
    expect(global.sails.helpers.jwt.signToken.firstCall.args).to.deep.equal([7, 'visitante']);
    expect(exits.success.firstCall.args[0]).to.deep.equal({
      usuario: { id: 7, email: 'ana@email.com', perfil: 'visitante', ativo: true },
      token: 'token-jwt'
    });
  });

  it('recusa senha errada com a mensagem genérica', async function () {
    await login.fn({ email: 'ana@email.com', senha: 'senha-errada' }, exits);

    expect(exits.credenciaisInvalidas.firstCall.args[0]).to.deep.equal({ error: 'E-mail ou senha inválidos.' });
    expect(global.sails.helpers.jwt.signToken.called).to.be.false;
  });

  it('recusa e-mail sem conta com a mesma mensagem (não revela quais e-mails existem)', async function () {
    global.Usuario.findOne.resolves(undefined);

    await login.fn({ email: 'ninguem@email.com', senha: 'qualquer' }, exits);

    expect(exits.credenciaisInvalidas.firstCall.args[0]).to.deep.equal({ error: 'E-mail ou senha inválidos.' });
  });

  it('recusa conta desativada', async function () {
    global.Usuario.findOne.resolves({ id: 7, senha: hashDaSenha, ativo: false });

    await login.fn({ email: 'ana@email.com', senha: 'senha-correta' }, exits);

    expect(exits.credenciaisInvalidas.calledOnce).to.be.true;
    expect(exits.success.called).to.be.false;
  });

  describe('limite de tentativas', function () {
    async function errarSenha(vezes, email) {
      for (let i = 0; i < vezes; i++) {
        await login.fn({ email: email || 'ana@email.com', senha: 'senha-errada' }, criarExits('credenciaisInvalidas', 'muitasTentativas'));
      }
    }

    it('bloqueia o e-mail depois de muitas senhas erradas, sem nem consultar o banco', async function () {
      await errarSenha(limiteLogin.MAX_FALHAS);
      global.Usuario.findOne.resetHistory();

      await login.fn({ email: 'ANA@email.com', senha: 'senha-correta' }, exits);

      expect(exits.muitasTentativas.calledOnce).to.be.true;
      expect(exits.muitasTentativas.firstCall.args[0].error).to.equal('Muitas tentativas de login com este e-mail. Tente novamente em 15 minutos.');
      expect(global.Usuario.findOne.called).to.be.false;
      expect(exits.success.called).to.be.false;
    });

    it('ainda deixa tentar antes de chegar no limite', async function () {
      await errarSenha(limiteLogin.MAX_FALHAS - 1);

      await login.fn({ email: 'ana@email.com', senha: 'senha-correta' }, exits);

      expect(exits.success.calledOnce).to.be.true;
    });

    it('um login certo zera a contagem', async function () {
      await errarSenha(limiteLogin.MAX_FALHAS - 1);
      await login.fn({ email: 'ana@email.com', senha: 'senha-correta' }, criarExits('credenciaisInvalidas', 'muitasTentativas'));
      await errarSenha(limiteLogin.MAX_FALHAS - 1);

      await login.fn({ email: 'ana@email.com', senha: 'senha-correta' }, exits);

      expect(exits.success.calledOnce).to.be.true;
    });

    it('e-mail sem conta também é bloqueado (o bloqueio não revela quais e-mails existem)', async function () {
      global.Usuario.findOne.resolves(undefined);
      await errarSenha(limiteLogin.MAX_FALHAS, 'ninguem@email.com');

      await login.fn({ email: 'ninguem@email.com', senha: 'qualquer' }, exits);

      expect(exits.muitasTentativas.calledOnce).to.be.true;
    });

    it('o bloqueio de um e-mail não afeta os outros', async function () {
      await errarSenha(limiteLogin.MAX_FALHAS);
      global.Usuario.findOne.resolves({ id: 8, email: 'bia@email.com', senha: hashDaSenha, perfil: 'visitante', ativo: true });

      await login.fn({ email: 'bia@email.com', senha: 'senha-correta' }, exits);

      expect(exits.success.calledOnce).to.be.true;
    });
  });
});
