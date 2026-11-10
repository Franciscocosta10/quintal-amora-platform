import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listarExpositores, criarExpositor, editarExpositor, removerExpositor } from './Expositor';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiFetch: vi.fn()
}));

describe('services/Expositor', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  describe('listarExpositores', () => {
    it('chama GET /expositor sem query string e sem token (rota pública)', () => {
      listarExpositores();
      expect(apiFetch).toHaveBeenCalledWith('/expositor', { auth: false });
    });

    it('monta a query string a partir dos filtros informados', () => {
      listarExpositores({ eventoId: 1, tipo: 'loja' });
      expect(apiFetch).toHaveBeenCalledWith('/expositor?eventoId=1&tipo=loja', { auth: false });
    });
  });

  it('criarExpositor envia POST /expositor/create com o corpo informado', () => {
    const dados = { nome: 'Loja X' };
    criarExpositor(dados);
    expect(apiFetch).toHaveBeenCalledWith('/expositor/create', { method: 'POST', body: dados });
  });

  it('editarExpositor envia PUT /expositor/update/:id com o corpo informado', () => {
    const dados = { nome: 'Editado' };
    editarExpositor(5, dados);
    expect(apiFetch).toHaveBeenCalledWith('/expositor/update/5', { method: 'PUT', body: dados });
  });

  it('removerExpositor envia DELETE /expositor/destroy/:id', () => {
    removerExpositor(5);
    expect(apiFetch).toHaveBeenCalledWith('/expositor/destroy/5', { method: 'DELETE' });
  });
});
