import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listarConcursos, criarConcurso, editarConcurso, removerConcurso } from './Contest';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiFetch: vi.fn()
}));

describe('services/Contest', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  describe('listarConcursos', () => {
    it('chama GET /contest sem query string quando não há filtros', () => {
      listarConcursos();
      expect(apiFetch).toHaveBeenCalledWith('/contest');
    });

    it('monta a query string a partir dos filtros informados', () => {
      listarConcursos({ eventoId: 1, categoria: 'cosplay' });
      expect(apiFetch).toHaveBeenCalledWith('/contest?eventoId=1&categoria=cosplay');
    });
  });

  it('criarConcurso envia POST /contest/create com o corpo informado', () => {
    const dados = { nome: 'Concurso X' };
    criarConcurso(dados);
    expect(apiFetch).toHaveBeenCalledWith('/contest/create', { method: 'POST', body: dados });
  });

  it('editarConcurso envia PUT /contest/update/:id com o corpo informado', () => {
    const dados = { nome: 'Editado' };
    editarConcurso(5, dados);
    expect(apiFetch).toHaveBeenCalledWith('/contest/update/5', { method: 'PUT', body: dados });
  });

  it('removerConcurso envia DELETE /contest/delete/:id', () => {
    removerConcurso(5);
    expect(apiFetch).toHaveBeenCalledWith('/contest/delete/5', { method: 'DELETE' });
  });
});