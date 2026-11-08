const { expect } = require('chai');
const sinon = require('sinon');
const registrationFindMine = require('../../../../api/controllers/registration/find-mine');

describe('registration/find-mine', function () {
  afterEach(function () {
    delete global.InscricaoConcurso;
  });

  it('retorna só as inscrições do usuário autenticado', async function () {
    const queryFalsa = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves([{ id: 1, concurso: { id: 1 } }])
    };
    global.InscricaoConcurso = { find: sinon.stub().returns(queryFalsa) };

    const contexto = { req: { usuario: { id: 7 } } };
    const resultado = await registrationFindMine.fn.call(contexto, {});

    expect(global.InscricaoConcurso.find.firstCall.args[0]).to.deep.equal({ usuario: 7 });
    expect(resultado).to.deep.equal([{ id: 1, concurso: { id: 1 } }]);
  });
});