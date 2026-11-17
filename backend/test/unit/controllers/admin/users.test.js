const { expect } = require('chai');
const sinon = require('sinon');
const userFind = require('../../../../api/controllers/admin/user-find');
const userCreate = require('../../../../api/controllers/admin/user-create');
const userUpdate = require('../../../../api/controllers/admin/user-update');

const USUARIO = {
  id: 5,
  nomeCompleto: 'Bia',
  email: 'bia@x.com',
  senha: 'hash-secreto',
  resetPasswordToken: 'token',
  perfil: 'visitante',
  ativo: true,
  createdAt: 100
};

describe('admin/user-*', function () {
  let exits;

  beforeEach(function () {
    global._ = require('@sailshq/lodash');
    global.Usuario = {};
    exits = {
      success: sinon.stub(),
      dadosInvalidos: sinon.stub(),
      emailJaCadastrado: sinon.stub(),
      notFound: sinon.stub()
    };
  });

  afterEach(function () {
    delete global.Usuario;
    delete global._;
  });

  describe('user-find', function () {
    it('lista só campos não sensíveis, em ordem alfabética', async function () {
      const sort = sinon.stub().resolves([USUARIO]);
      global.Usuario.find = sinon.stub().returns({ sort: sort });

      const resultado = await userFind.fn();

      expect(global.Usuario.find.firstCall.args[0].select)
        .to.deep.equal(['nomeCompleto', 'email', 'perfil', 'ativo', 'createdAt']);
      expect(sort.firstCall.args[0]).to.equal('nomeCompleto ASC');
      expect(resultado).to.have.length(1);
    });
  });

  describe('user-create', function () {
    beforeEach(function () {
      global.Usuario.findOne = sinon.stub().resolves(null);
      global.Usuario.create = sinon.stub().returns({ fetch: sinon.stub().resolves(USUARIO) });
    });

    it('cria a conta com o perfil escolhido e não devolve a senha', async function () {
      await userCreate.fn(
        { nomeCompleto: '  Bia ', email: ' BIA@x.com', senha: '12345678', perfil: 'administrador' },
        exits
      );

      expect(global.Usuario.create.firstCall.args[0]).to.deep.equal({
        nomeCompleto: 'Bia',
        email: 'bia@x.com',
        senha: '12345678',
        perfil: 'administrador'
      });
      const devolvido = exits.success.firstCall.args[0];
      expect(devolvido).to.not.have.property('senha');
      expect(devolvido).to.not.have.property('resetPasswordToken');
      expect(devolvido).to.include({ id: 5, email: 'bia@x.com' });
    });

    it('recusa e-mail já cadastrado', async function () {
      global.Usuario.findOne.resolves(USUARIO);

      await userCreate.fn({ nomeCompleto: 'Bia', email: 'bia@x.com', senha: '12345678', perfil: 'visitante' }, exits);

      expect(exits.emailJaCadastrado.calledOnce).to.equal(true);
      expect(global.Usuario.create.called).to.equal(false);
    });

    it('recusa nome só com espaços', async function () {
      await userCreate.fn({ nomeCompleto: '   ', email: 'bia@x.com', senha: '12345678', perfil: 'visitante' }, exits);

      expect(exits.dadosInvalidos.firstCall.args[0].error).to.equal('Informe o nome do usuário.');
    });
  });

  describe('user-update', function () {
    let set;
    const contexto = { req: { usuario: { id: 1 } } };

    beforeEach(function () {
      set = sinon.stub().resolves(Object.assign({}, USUARIO, { ativo: false }));
      global.Usuario.updateOne = sinon.stub().returns({ set: set });
    });

    it('desativa o usuário sem apagar e não devolve a senha', async function () {
      await userUpdate.fn.call(contexto, { id: 5, ativo: false }, exits);

      expect(global.Usuario.updateOne.firstCall.args[0]).to.deep.equal({ id: 5 });
      expect(set.firstCall.args[0]).to.deep.equal({ ativo: false });
      expect(exits.success.firstCall.args[0]).to.not.have.property('senha');
      expect(exits.success.firstCall.args[0].ativo).to.equal(false);
    });

    it('troca o perfil', async function () {
      await userUpdate.fn.call(contexto, { id: 5, perfil: 'administrador' }, exits);

      expect(set.firstCall.args[0]).to.deep.equal({ perfil: 'administrador' });
    });

    it('não deixa o admin alterar a própria conta', async function () {
      await userUpdate.fn.call(contexto, { id: 1, ativo: false }, exits);

      expect(exits.dadosInvalidos.calledOnce).to.equal(true);
      expect(global.Usuario.updateOne.called).to.equal(false);
    });

    it('recusa quando não há nada para alterar', async function () {
      await userUpdate.fn.call(contexto, { id: 5 }, exits);

      expect(exits.dadosInvalidos.firstCall.args[0].error).to.equal('Informe o que deve ser alterado.');
    });

    it('avisa quando o usuário não existe', async function () {
      set.resolves(undefined);

      await userUpdate.fn.call(contexto, { id: 99, ativo: true }, exits);

      expect(exits.notFound.calledOnce).to.equal(true);
    });
  });
});
