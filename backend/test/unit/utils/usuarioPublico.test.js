const { expect } = require('chai');
const { CAMPOS_PRIVADOS, semCamposPrivados } = require('../../../api/utils/usuarioPublico');

describe('utils/usuarioPublico', function () {
  it('esconde a senha e os dados internos da recuperação de senha', function () {
    expect(CAMPOS_PRIVADOS).to.have.members(['senha', 'resetPasswordToken', 'resetPasswordExpiresAt']);
  });

  it('remove os campos privados e mantém os demais', function () {
    const usuario = {
      id: 7,
      nomeCompleto: 'Ana Souza',
      email: 'ana@email.com',
      perfil: 'visitante',
      senha: 'hash-bcrypt',
      resetPasswordToken: 'hash-do-token',
      resetPasswordExpiresAt: 1700000000000
    };

    expect(semCamposPrivados(usuario)).to.deep.equal({
      id: 7,
      nomeCompleto: 'Ana Souza',
      email: 'ana@email.com',
      perfil: 'visitante'
    });
  });

  it('não altera o objeto recebido', function () {
    const usuario = { id: 7, senha: 'hash-bcrypt' };

    semCamposPrivados(usuario);

    expect(usuario).to.deep.equal({ id: 7, senha: 'hash-bcrypt' });
  });

  it('funciona quando os campos privados nem existem', function () {
    expect(semCamposPrivados({ id: 7 })).to.deep.equal({ id: 7 });
  });
});
