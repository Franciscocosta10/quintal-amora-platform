import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  inscreverEmConcurso,
  cancelarInscricao,
  listarMinhasInscricoes,
  listarInscritosDoConcurso
} from './Registration';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiFetch: vi.fn()
}));

describe('services/Registration', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  it('inscreverEmConcurso envia POST /contest/:id/register com corpo vazio', () => {
    inscreverEmConcurso(3);
    expect(apiFetch).toHaveBeenCalledWith('/contest/3/register', { method: 'POST', body: {} });
  });

  it('codifica o id na URL, para um valor estranho não mudar o caminho chamado', () => {
    cancelarInscricao('1/../../admin/users');
    expect(apiFetch).toHaveBeenCalledWith('/registration/1%2F..%2F..%2Fadmin%2Fusers', { method: 'DELETE' });
  });

  it('cancelarInscricao envia DELETE /registration/:id', () => {
    cancelarInscricao(10);
    expect(apiFetch).toHaveBeenCalledWith('/registration/10', { method: 'DELETE' });
  });

  it('listarMinhasInscricoes chama GET /registration/mine', () => {
    listarMinhasInscricoes();
    expect(apiFetch).toHaveBeenCalledWith('/registration/mine');
  });

  it('listarInscritosDoConcurso chama GET /contest/:id/registrations', () => {
    listarInscritosDoConcurso(3);
    expect(apiFetch).toHaveBeenCalledWith('/contest/3/registrations');
  });
});