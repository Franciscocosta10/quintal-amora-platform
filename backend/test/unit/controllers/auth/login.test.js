const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const login = require('../../../../api/controllers/auth/login');
const criarExits = require('../../support/exits');

describe('auth/login', function () {
  let exits;
  let hashDaSenha;

  before(async function () {
    hashDaSenha = await bcrypt.hash('senha-correta', 4);
  });

  beforeEach(function () {
    global._ = require('@sailshq/lodash');
    exits = criarExits('credenciaisInvalidas');
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
});
