const { expect } = require('chai');
const sinon = require('sinon');
const changePhoto = require('../../../../api/controllers/auth/change-photo');

const FOTO_VALIDA = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==';
const contexto = { req: { usuario: { id: 7 } } };

async function erroDe(inputs) {
  try {
    await changePhoto.fn.call(contexto, inputs);
  } catch (erro) {
    return erro.badRequest.message;
  }
  throw new Error('deveria ter lançado badRequest');
}

describe('auth/change-photo', function () {
  let set;

  beforeEach(function () {
    global._ = require('@sailshq/lodash');
    set = sinon.stub().resolves({ id: 7, nomeCompleto: 'Ana', senha: 'hash', fotoPerfil: FOTO_VALIDA });
    global.Usuario = { updateOne: sinon.stub().returns({ set }) };
  });

  afterEach(function () {
    delete global._;
    delete global.Usuario;
  });

  it('grava a foto do próprio usuário logado e não devolve a senha', async function () {
    const resultado = await changePhoto.fn.call(contexto, { fotoPerfil: FOTO_VALIDA });

    expect(global.Usuario.updateOne.firstCall.args[0]).to.deep.equal({ id: 7 });
    expect(set.firstCall.args[0]).to.deep.equal({ fotoPerfil: FOTO_VALIDA });
    expect(resultado).to.deep.equal({ id: 7, nomeCompleto: 'Ana', fotoPerfil: FOTO_VALIDA });
  });

  it('aceita null para remover a foto', async function () {
    await changePhoto.fn.call(contexto, { fotoPerfil: null });

    expect(set.firstCall.args[0]).to.deep.equal({ fotoPerfil: null });
  });

  it('rejeita quando a foto não é enviada', async function () {
    expect(await erroDe({})).to.equal('Envie uma foto (ou null para remover).');
    expect(global.Usuario.updateOne.called).to.be.false;
  });

  it('rejeita o que não for imagem JPG, PNG ou WebP em base64', async function () {
    const invalidas = [
      'https://exemplo.com/foto.png',
      'data:image/svg+xml;base64,PHN2Zz4=',
      'data:text/html;base64,PHNjcmlwdD4=',
      'data:image/png;base64,abc"><script>'
    ];

    for (const foto of invalidas) {
      expect(await erroDe({ fotoPerfil: foto })).to.equal('Envie uma imagem JPG, PNG ou WebP.');
    }
    expect(global.Usuario.updateOne.called).to.be.false;
  });

  it('rejeita fotos grandes demais', async function () {
    const grande = 'data:image/png;base64,' + 'A'.repeat(400 * 1024);

    expect(await erroDe({ fotoPerfil: grande })).to.equal('A foto é grande demais. Escolha uma imagem menor.');
    expect(global.Usuario.updateOne.called).to.be.false;
  });
});
