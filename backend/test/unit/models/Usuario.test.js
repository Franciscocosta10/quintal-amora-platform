const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const Usuario = require('../../../api/models/Usuario');

// Os hooks do model usam callback (`proceed`); aqui viram Promise.
function rodarHook(hook, valores) {
  return new Promise((resolve, reject) => {
    hook(valores, (erro) => (erro ? reject(erro) : resolve(valores)));
  });
}

describe('models/Usuario', function () {
  beforeEach(function () {
    global._ = require('@sailshq/lodash');
  });

  afterEach(function () {
    delete global._;
  });

  it('guarda o hash da senha ao criar, nunca o texto puro', async function () {
    const valores = await rodarHook(Usuario.beforeCreate, { email: 'ana@email.com', senha: '12345678' });

    expect(valores.senha).to.not.equal('12345678');
    expect(await bcrypt.compare('12345678', valores.senha)).to.be.true;
  });

  it('recusa criar usuário sem senha', async function () {
    try {
      await rodarHook(Usuario.beforeCreate, { email: 'ana@email.com' });
      throw new Error('deveria ter recusado');
    } catch (erro) {
      expect(erro.message).to.equal('Senha é obrigatória.');
    }
  });

  it('faz o hash da nova senha ao atualizar (redefinição de senha)', async function () {
    const valores = await rodarHook(Usuario.beforeUpdate, { senha: 'novaSenha1' });

    expect(await bcrypt.compare('novaSenha1', valores.senha)).to.be.true;
  });

  it('não mexe nos dados quando a atualização não troca a senha', async function () {
    const valores = await rodarHook(Usuario.beforeUpdate, { nomeCompleto: 'Ana' });

    expect(valores).to.deep.equal({ nomeCompleto: 'Ana' });
  });

  it('nunca inclui a senha no JSON da resposta', function () {
    const registro = { id: 7, email: 'ana@email.com', senha: 'hash' };

    expect(Usuario.customToJSON.call(registro)).to.deep.equal({ id: 7, email: 'ana@email.com' });
  });

  it('só aceita os perfis visitante e administrador, com visitante por padrão (RF03)', function () {
    expect(Usuario.attributes.perfil.isIn).to.deep.equal(['visitante', 'administrador']);
    expect(Usuario.attributes.perfil.defaultsTo).to.equal('visitante');
  });
});
