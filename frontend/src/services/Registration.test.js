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