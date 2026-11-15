import { describe, it, expect, vi } from 'vitest';
import { atualizarDadosPerfil, atualizarFotoPerfil } from './perfil';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn().mockResolvedValue({ id: 1 }) }));

describe('atualizarFotoPerfil', () => {
  it('envia a foto (ou null) para PUT /auth/change-photo', async () => {
    await expect(atualizarFotoPerfil('data:image/jpeg;base64,X')).resolves.toEqual({ id: 1 });
    expect(apiFetch).toHaveBeenCalledWith('/auth/change-photo', { method: 'PUT', body: { fotoPerfil: 'data:image/jpeg;base64,X' } });

    await atualizarFotoPerfil(null);
    expect(apiFetch).toHaveBeenLastCalledWith('/auth/change-photo', { method: 'PUT', body: { fotoPerfil: null } });
  });

  it('envia nome e e-mail para PUT /auth/update-profile', async () => {
    await atualizarDadosPerfil({ nomeCompleto: 'Ana', email: 'ana@email.com' });
    expect(apiFetch).toHaveBeenLastCalledWith('/auth/update-profile', { method: 'PUT', body: { nomeCompleto: 'Ana', email: 'ana@email.com' } });
  });
});
