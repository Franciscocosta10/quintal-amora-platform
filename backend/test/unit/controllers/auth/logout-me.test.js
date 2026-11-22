const { expect } = require('chai');
const logout = require('../../../../api/controllers/auth/logout');
const me = require('../../../../api/controllers/auth/me');
const criarExits = require('../../support/exits');

describe('auth/logout', function () {
  it('confirma o logout (o token é descartado no cliente)', async function () {
    const exits = criarExits();

    await logout.fn({}, exits);

    expect(exits.success.firstCall.args[0]).to.deep.equal({ message: 'Logout realizado. Descarte o token no cliente.' });
  });
});

describe('auth/me', function () {
  beforeEach(function () {
    global._ = require('@sailshq/lodash');
  });

  afterEach(function () {
    delete global._;
  });

  it('devolve o usuário autenticado sem a senha e sem os dados da recuperação de senha', async function () {
    const exits = criarExits();
    const contexto = {
      req: {
        usuario: {
          id: 7,
          nomeCompleto: 'Ana',
          perfil: 'administrador',
          senha: 'hash',
          resetPasswordToken: 'hash-do-token',
          resetPasswordExpiresAt: 1700000000000
        }
      }
    };

    await me.fn.call(contexto, {}, exits);

    expect(exits.success.firstCall.args[0]).to.deep.equal({ id: 7, nomeCompleto: 'Ana', perfil: 'administrador' });
  });
});
