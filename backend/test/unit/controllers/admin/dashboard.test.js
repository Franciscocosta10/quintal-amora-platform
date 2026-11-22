const { expect } = require('chai');
const sinon = require('sinon');
const adminDashboard = require('../../../../api/controllers/admin/dashboard');

// Query encadeável do Waterline (.sort().limit()) que resolve no fim.
function queryFalsa(resultado) {
  return {
    sort: sinon.stub().returnsThis(),
    limit: sinon.stub().resolves(resultado)
  };
}

const EVENTO = {
  id: 7,
  nome: 'Quintal da Amora',
  edicao: 15,
  localizacao: 'Joinville',
  dataHoraInicio: 1000,
  dataHoraFim: 2000,
  ativo: true,
  descricao: 'não deve ir para o painel'
};

const USUARIOS = [{ id: 1, nomeCompleto: 'Ana', email: 'ana@x.com', perfil: 'visitante' }];
const ATIVIDADES = [{ id: 3, titulo: 'Abertura', dataHoraInicio: 5000 }];

describe('admin/dashboard', function () {
  beforeEach(function () {
    global.Evento = { find: sinon.stub().returns(queryFalsa([EVENTO])) };
    global.Usuario = {
      count: sinon.stub().resolves(120),
      find: sinon.stub().returns(queryFalsa(USUARIOS))
    };
    global.Concurso = {
      find: sinon.stub().resolves([
        { id: 1, status: 'aberto' },
        { id: 2, status: 'encerrado' },
        { id: 3, status: 'aberto' }
      ])
    };
    global.InscricaoConcurso = { count: sinon.stub().resolves(40) };
    global.Checkin = { count: sinon.stub().resolves(85) };
    global.Atividade = {
      count: sinon.stub().resolves(12),
      find: sinon.stub().returns(queryFalsa(ATIVIDADES))
    };
    global.Expositor = { count: sinon.stub().resolves(9) };
  });

  afterEach(function () {
    ['Evento', 'Usuario', 'Concurso', 'InscricaoConcurso', 'Checkin', 'Atividade', 'Expositor']
      .forEach((model) => delete global[model]);
  });

  it('retorna os totais do evento atual', async function () {
    const resultado = await adminDashboard.fn();

    expect(resultado.totais).to.deep.equal({
      participantes: 120,
      checkins: 85,
      atividades: 12,
      concursosAbertos: 2,
      inscricoes: 40,
      expositores: 9
    });
  });

  it('devolve só os campos públicos do evento', async function () {
    const resultado = await adminDashboard.fn();

    expect(resultado.evento).to.not.have.property('descricao');
    expect(resultado.evento).to.include({ id: 7, nome: 'Quintal da Amora', edicao: 15 });
  });

  it('filtra as contagens pelo evento atual', async function () {
    await adminDashboard.fn();

    expect(global.Checkin.count.firstCall.args[0]).to.deep.equal({ evento: 7 });
    expect(global.Expositor.count.firstCall.args[0]).to.deep.equal({ evento: 7 });
    expect(global.Atividade.count.firstCall.args[0]).to.deep.equal({
      evento: 7,
      status: { '!=': 'cancelada' }
    });
  });

  it('conta só inscrições não canceladas dos concursos do evento', async function () {
    await adminDashboard.fn();

    expect(global.InscricaoConcurso.count.firstCall.args[0]).to.deep.equal({
      concurso: { in: [1, 2, 3] },
      status: { '!=': 'cancelado' }
    });
  });

  it('não consulta inscrições quando o evento não tem concursos', async function () {
    global.Concurso.find.resolves([]);

    const resultado = await adminDashboard.fn();

    expect(global.InscricaoConcurso.count.called).to.equal(false);
    expect(resultado.totais.inscricoes).to.equal(0);
    expect(resultado.totais.concursosAbertos).to.equal(0);
  });

  it('conta como participantes só visitantes ativos', async function () {
    await adminDashboard.fn();

    expect(global.Usuario.count.firstCall.args[0]).to.deep.equal({ perfil: 'visitante', ativo: true });
  });

  it('busca usuários recentes sem a senha', async function () {
    const resultado = await adminDashboard.fn();

    const criterio = global.Usuario.find.firstCall.args[0];
    expect(criterio.select).to.not.include('senha');
    expect(resultado.usuariosRecentes).to.deep.equal(USUARIOS);
  });

  it('não busca a lista de próximas atividades', async function () {
    const resultado = await adminDashboard.fn();

    expect(global.Atividade.find.called).to.equal(false);
    expect(resultado).to.not.have.property('proximasAtividades');
  });

  it('zera os dados do evento quando nenhum evento foi cadastrado', async function () {
    global.Evento.find.returns(queryFalsa([]));

    const resultado = await adminDashboard.fn();

    expect(resultado.evento).to.equal(null);
    expect(resultado.totais).to.deep.equal({
      participantes: 120,
      checkins: 0,
      atividades: 0,
      concursosAbertos: 0,
      inscricoes: 0,
      expositores: 0
    });
    expect(resultado).to.not.have.property('proximasAtividades');
    expect(resultado.usuariosRecentes).to.deep.equal(USUARIOS);
    expect(global.Checkin.count.called).to.equal(false);
  });
});
