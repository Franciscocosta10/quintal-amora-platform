const { expect } = require('chai');
const { CAMPOS_PUBLICOS, apenasCamposPublicos } = require('../../../api/utils/usuarioPublico');

describe('utils/usuarioPublico', function () {
  const USUARIO_COMPLETO = {
    id: 7,
    nomeCompleto: 'Ana Souza',
    email: 'ana@email.com',
    perfil: 'visitante',
    fotoPerfil: 'data:image/jpeg;base64,abc',
    ativo: true,
    createdAt: 1700000000000,
    updatedAt: 1700000001000,
    senha: 'hash-bcrypt',
    resetPasswordToken: 'hash-do-token',
    resetPasswordExpiresAt: 1700000002000
  };

  it('a allowlist não inclui a senha nem os dados da recuperação de senha', function () {
    expect(CAMPOS_PUBLICOS).to.not.include('senha');
    expect(CAMPOS_PUBLICOS).to.not.include('resetPasswordToken');
    expect(CAMPOS_PUBLICOS).to.not.include('resetPasswordExpiresAt');
  });

  it('devolve só os campos públicos', function () {
    expect(apenasCamposPublicos(USUARIO_COMPLETO)).to.deep.equal({
      id: 7,
      nomeCompleto: 'Ana Souza',
      email: 'ana@email.com',
      perfil: 'visitante',
      fotoPerfil: 'data:image/jpeg;base64,abc',
      ativo: true,
      createdAt: 1700000000000,
      updatedAt: 1700000001000
    });
  });

  it('um campo novo do model fica fora da resposta até ser liberado na allowlist', function () {
    const comCampoNovo = { ...USUARIO_COMPLETO, telefone: '47999999999', tokenIntegracao: 'segredo' };

    const resposta = apenasCamposPublicos(comCampoNovo);

    expect(resposta).to.not.have.property('telefone');
    expect(resposta).to.not.have.property('tokenIntegracao');
  });

  it('não inventa campos que o usuário não tem', function () {
    expect(apenasCamposPublicos({ id: 7, senha: 'hash' })).to.deep.equal({ id: 7 });
  });

  it('não altera o objeto recebido', function () {
    const usuario = { id: 7, senha: 'hash-bcrypt' };

    apenasCamposPublicos(usuario);

    expect(usuario).to.deep.equal({ id: 7, senha: 'hash-bcrypt' });
  });

  it('aceita valor vazio sem quebrar', function () {
    expect(apenasCamposPublicos(undefined)).to.deep.equal({});
  });
});
