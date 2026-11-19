const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const isLoggedIn = require('../../../api/policies/isLoggedIn');
const isAdmin = require('../../../api/policies/isAdmin');

const SEGREDO = 'segredo-de-teste';

function criarRes() {
  const res = { json: sinon.stub() };
  res.status = sinon.stub().returns(res);
  return res;
}

function respostaDe(res) {
  return { status: res.status.firstCall.args[0], corpo: res.json.firstCall.args[0] };
}

describe('policies/isLoggedIn (RNF05)', function () {
  let res;
  let proceed;

  beforeEach(function () {
    res = criarRes();
    proceed = sinon.stub();
    global.sails = { config: { custom: { jwtSecret: SEGREDO } } };
    global.Usuario = { findOne: sinon.stub().resolves({ id: 7, perfil: 'visitante', ativo: true }) };
  });

  afterEach(function () {
    delete global.sails;
    delete global.Usuario;
  });

  it('com token válido, carrega o usuário do banco em req.usuario e libera', async function () {
    const req = { headers: { authorization: `Bearer ${jwt.sign({ id: 7, perfil: 'visitante' }, SEGREDO)}` } };

    await isLoggedIn(req, res, proceed);

    expect(global.Usuario.findOne.firstCall.args[0]).to.deep.equal({ id: 7 });
    expect(req.usuario).to.deep.equal({ id: 7, perfil: 'visitante', ativo: true });
    expect(proceed.calledOnce).to.be.true;
  });

  it('recusa requisição sem o header Authorization', async function () {
    await isLoggedIn({ headers: {} }, res, proceed);

    expect(respostaDe(res)).to.deep.equal({ status: 401, corpo: { error: 'Token não fornecido.' } });
    expect(proceed.called).to.be.false;
  });

  it('recusa header que não é Bearer', async function () {
    await isLoggedIn({ headers: { authorization: 'Basic abc' } }, res, proceed);

    expect(respostaDe(res).corpo).to.deep.equal({ error: 'Token não fornecido.' });
  });

  it('recusa token assinado com outro segredo', async function () {
    const req = { headers: { authorization: `Bearer ${jwt.sign({ id: 7 }, 'outro-segredo')}` } };

    await isLoggedIn(req, res, proceed);

    expect(respostaDe(res)).to.deep.equal({ status: 401, corpo: { error: 'Token inválido ou expirado.' } });
    expect(global.Usuario.findOne.called).to.be.false;
  });

  it('recusa token expirado', async function () {
    const expirado = jwt.sign({ id: 7, exp: Math.floor(Date.now() / 1000) - 60 }, SEGREDO);

    await isLoggedIn({ headers: { authorization: `Bearer ${expirado}` } }, res, proceed);

    expect(respostaDe(res).corpo).to.deep.equal({ error: 'Token inválido ou expirado.' });
  });

  it('recusa token de usuário que não existe mais', async function () {
    global.Usuario.findOne.resolves(undefined);
    const req = { headers: { authorization: `Bearer ${jwt.sign({ id: 7 }, SEGREDO)}` } };

    await isLoggedIn(req, res, proceed);

    expect(respostaDe(res)).to.deep.equal({ status: 401, corpo: { error: 'Usuário inválido ou inativo.' } });
  });

  it('recusa usuário desativado', async function () {
    global.Usuario.findOne.resolves({ id: 7, ativo: false });
    const req = { headers: { authorization: `Bearer ${jwt.sign({ id: 7 }, SEGREDO)}` } };

    await isLoggedIn(req, res, proceed);

    expect(respostaDe(res).corpo).to.deep.equal({ error: 'Usuário inválido ou inativo.' });
    expect(req.usuario).to.equal(undefined);
  });
});

describe('policies/isAdmin (RNF07, Exceção 2)', function () {
  let res;
  let proceed;

  beforeEach(function () {
    res = criarRes();
    proceed = sinon.stub();
  });

  it('libera administrador', async function () {
    await isAdmin({ usuario: { id: 1, perfil: 'administrador' } }, res, proceed);

    expect(proceed.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it('bloqueia visitante com 403', async function () {
    await isAdmin({ usuario: { id: 7, perfil: 'visitante' } }, res, proceed);

    expect(respostaDe(res)).to.deep.equal({ status: 403, corpo: { error: 'Acesso permitido somente para administradores.' } });
    expect(proceed.called).to.be.false;
  });

  it('responde 401 se rodar sem usuário autenticado', async function () {
    await isAdmin({}, res, proceed);

    expect(respostaDe(res)).to.deep.equal({ status: 401, corpo: { error: 'Usuário não autenticado.' } });
  });
});
