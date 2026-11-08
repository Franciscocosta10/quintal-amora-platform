const { expect } = require('chai');
const sinon = require('sinon');
const registrationCancel = require('../../../../api/controllers/registration/cancel');

describe('registration/cancel', function () {
  let inscricaoExistente;

  beforeEach(function () {
    inscricaoExistente = { id: 10, usuario: 7, concurso: 1 };

    global.InscricaoConcurso = {
      findOne: sinon.stub().resolves(inscricaoExistente),
      updateOne: sinon.stub().returns({ set: sinon.stub().resolves({ id: 10, status: 'cancelado' }) })
    };
  });

  afterEach(function () {
    delete global.InscricaoConcurso;
  });

  it('permite o dono da inscrição cancelar a própria inscrição', async function () {
    const contexto = { req: { usuario: { id: 7, perfil: 'visitante' } } };

    const resultado = await registrationCancel.fn.call(contexto, { id: 10 });
    expect(resultado).to.deep.equal({ id: 10, status: 'cancelado' });
  });

  it('permite um administrador cancelar a inscrição de outro usuário', async function () {
    const contexto = { req: { usuario: { id: 999, perfil: 'administrador' } } };

    const resultado = await registrationCancel.fn.call(contexto, { id: 10 });
    expect(resultado).to.deep.equal({ id: 10, status: 'cancelado' });
  });

  it('rejeita (forbidden) quando não é o dono nem é admin', async function () {
    const contexto = { req: { usuario: { id: 999, perfil: 'visitante' } } };

    try {
      await registrationCancel.fn.call(contexto, { id: 10 });
      throw new Error('deveria ter lançado forbidden');
    } catch (erro) {
      expect(erro).to.equal('forbidden');
    }
  });

  it('retorna notFound quando a inscrição não existe', async function () {
    global.InscricaoConcurso.findOne.resolves(undefined);
    const contexto = { req: { usuario: { id: 7, perfil: 'visitante' } } };

    try {
      await registrationCancel.fn.call(contexto, { id: 999 });
      throw new Error('deveria ter lançado notFound');
    } catch (erro) {
      expect(erro).to.equal('notFound');
    }
  });
});