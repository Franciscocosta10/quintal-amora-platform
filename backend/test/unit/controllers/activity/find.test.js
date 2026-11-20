const { expect } = require('chai');
const sinon = require('sinon');
const activityFind = require('../../../../api/controllers/activity/find');

const ATIVIDADES = [{ id: 1, titulo: 'Abertura' }, { id: 2, titulo: 'Karaokê' }];

describe('activity/find (RF06)', function () {
  let consulta;

  beforeEach(function () {
    // A consulta do Waterline é "thenable": dá para encadear sort/limit e depois dar await.
    consulta = {
      sort: sinon.stub(),
      limit: sinon.stub(),
      then: (resolver, rejeitar) => Promise.resolve(ATIVIDADES).then(resolver, rejeitar)
    };
    consulta.sort.returns(consulta);
    consulta.limit.returns(consulta);
    global.Atividade = { find: sinon.stub().returns(consulta) };
  });

  afterEach(function () {
    delete global.Atividade;
  });

  it('lista toda a programação em ordem de horário', async function () {
    const atividades = await activityFind.fn({});

    expect(global.Atividade.find.firstCall.args[0]).to.deep.equal({});
    expect(consulta.sort.firstCall.args[0]).to.equal('dataHoraInicio ASC');
    expect(consulta.limit.called).to.be.false;
    expect(atividades).to.deep.equal(ATIVIDADES);
  });

  it('filtra por evento e por destaque', async function () {
    await activityFind.fn({ eventoId: 3, destaque: true });

    expect(global.Atividade.find.firstCall.args[0]).to.deep.equal({ evento: 3, destaque: true });
  });

  it('aceita destaque false como filtro', async function () {
    await activityFind.fn({ destaque: false });

    expect(global.Atividade.find.firstCall.args[0]).to.deep.equal({ destaque: false });
  });

  it('filtra pelo dia inteiro no horário de Brasília', async function () {
    await activityFind.fn({ dia: '2026-11-21' });

    expect(global.Atividade.find.firstCall.args[0].dataHoraInicio).to.deep.equal({
      '>=': new Date('2026-11-21T00:00:00-03:00').getTime(),
      '<=': new Date('2026-11-21T23:59:59.999-03:00').getTime()
    });
  });

  it('rejeita dia em formato inválido', async function () {
    try {
      await activityFind.fn({ dia: '21/11/2026' });
      throw new Error('deveria ter lançado badRequest');
    } catch (erro) {
      expect(erro.badRequest.message).to.equal('Formato de data inválido. Use YYYY-MM-DD.');
    }
    expect(global.Atividade.find.called).to.be.false;
  });

  it('limita a quantidade (preview da Home)', async function () {
    await activityFind.fn({ limit: 3 });

    expect(consulta.limit.firstCall.args[0]).to.equal(3);
  });

  [0, 101].forEach((limite) => {
    it(`rejeita limite fora de 1 a 100 (${limite})`, async function () {
      try {
        await activityFind.fn({ limit: limite });
        throw new Error('deveria ter lançado badRequest');
      } catch (erro) {
        expect(erro.badRequest.message).to.equal('O limite deve estar entre 1 e 100.');
      }
    });
  });
});
