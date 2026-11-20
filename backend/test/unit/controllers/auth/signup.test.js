const { expect } = require('chai');
const sinon = require('sinon');
const signup = require('../../../../api/controllers/auth/signup');
const criarExits = require('../../support/exits');

describe('auth/signup', function () {
  let exits;
  let fetch;

  beforeEach(function () {
    global._ = require('@sailshq/lodash');
    exits = criarExits('emailJaCadastrado');
    fetch = sinon.stub().callsFake(() => Promise.resolve({ id: 10, ...global.Usuario.create.firstCall.args[0], senha: 'hash' }));
    global.Usuario = {
      findOne: sinon.stub().resolves(undefined),
      create: sinon.stub().returns({ fetch })
    };
    global.sails = { helpers: { jwt: { signToken: sinon.stub().resolves('token-jwt') } } };
  });

  afterEach(function () {
    delete global._;
    delete global.Usuario;
    delete global.sails;
  });

  it('cria a conta como visitante (RF03), com nome e e-mail normalizados', async function () {
    await signup.fn({ nomeCompleto: '  Ana Souza ', email: ' ANA@Email.com ', senha: '12345678' }, exits);

    expect(global.Usuario.create.firstCall.args[0]).to.deep.equal({
      nomeCompleto: 'Ana Souza',
      email: 'ana@email.com',
      senha: '12345678',
      perfil: 'visitante'
    });
    expect(global.sails.helpers.jwt.signToken.firstCall.args).to.deep.equal([10, 'visitante']);
  });

  it('devolve o token e o usuário sem a senha', async function () {
    await signup.fn({ nomeCompleto: 'Ana', email: 'ana@email.com', senha: '12345678' }, exits);

    const resposta = exits.success.firstCall.args[0];
    expect(resposta.token).to.equal('token-jwt');
    expect(resposta.usuario).to.not.have.property('senha');
    expect(resposta.usuario).to.include({ id: 10, email: 'ana@email.com' });
  });

  it('recusa e-mail que já tem conta', async function () {
    global.Usuario.findOne.resolves({ id: 3 });

    await signup.fn({ nomeCompleto: 'Ana', email: 'ana@email.com', senha: '12345678' }, exits);

    expect(exits.emailJaCadastrado.firstCall.args[0]).to.deep.equal({ error: 'Este e-mail já está cadastrado.' });
    expect(global.Usuario.create.called).to.be.false;
  });
});
