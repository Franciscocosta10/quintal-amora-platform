import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useContests } from './useContests';
import { useFavoriteContests } from './useFavoriteContests';
import { useMyRegistrations } from './useMyRegistrations';
import { listarConcursos } from '../services/Contest';
import { listarMinhasInscricoes } from '../services/Registration';

vi.mock('../services/Contest', () => ({ listarConcursos: vi.fn() }));
vi.mock('../services/Registration', () => ({ listarMinhasInscricoes: vi.fn() }));

const STORAGE_KEY = 'quintalAmora:concursosFavoritos';

function criarPromessaControlada() {
  let resolver;
  let rejeitar;
  const promessa = new Promise((resolve, reject) => {
    resolver = resolve;
    rejeitar = reject;
  });
  return { promessa, resolver, rejeitar };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('useContests', () => {
  it('busca os concursos sem filtro quando não há eventoId', async () => {
    listarConcursos.mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useContests());
    expect(result.current.carregando).toBe(true);

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(listarConcursos).toHaveBeenCalledWith({});
    expect(result.current.concursos).toEqual([{ id: 1 }]);
    expect(result.current.erro).toBeNull();
  });

  it('filtra pelo eventoId e busca de novo quando ele muda', async () => {
    listarConcursos.mockResolvedValue([]);

    const { result, rerender } = renderHook(({ eventoId }) => useContests(eventoId), {
      initialProps: { eventoId: 5 }
    });
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(listarConcursos).toHaveBeenLastCalledWith({ eventoId: 5 });

    rerender({ eventoId: 6 });
    await waitFor(() => expect(listarConcursos).toHaveBeenLastCalledWith({ eventoId: 6 }));
    await waitFor(() => expect(result.current.carregando).toBe(false));
  });

  it('usa lista vazia quando a API não retorna dados', async () => {
    listarConcursos.mockResolvedValue(null);

    const { result } = renderHook(() => useContests());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.concursos).toEqual([]);
  });

  it('expõe o erro quando a busca falha', async () => {
    const falha = new Error('falhou');
    listarConcursos.mockRejectedValue(falha);

    const { result } = renderHook(() => useContests());

    await waitFor(() => expect(result.current.erro).toBe(falha));
    expect(result.current.carregando).toBe(false);
  });

  it('ignora o sucesso que chega depois de desmontar', async () => {
    const { promessa, resolver } = criarPromessaControlada();
    listarConcursos.mockReturnValue(promessa);

    const { result, unmount } = renderHook(() => useContests());
    unmount();

    await act(async () => resolver([{ id: 1 }]));
    expect(result.current.concursos).toEqual([]);
    expect(result.current.carregando).toBe(true);
  });

  it('ignora a falha que chega depois de desmontar', async () => {
    const { promessa, rejeitar } = criarPromessaControlada();
    listarConcursos.mockReturnValue(promessa);

    const { result, unmount } = renderHook(() => useContests());
    unmount();

    await act(async () => rejeitar(new Error('falhou')));
    expect(result.current.erro).toBeNull();
  });
});

describe('useMyRegistrations', () => {
  it('carrega as inscrições do usuário', async () => {
    listarMinhasInscricoes.mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useMyRegistrations());
    expect(result.current.carregando).toBe(true);

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.inscricoes).toEqual([{ id: 1 }]);
  });

  it('usa lista vazia quando a API não retorna dados ou falha', async () => {
    listarMinhasInscricoes.mockResolvedValueOnce(null);
    const semDados = renderHook(() => useMyRegistrations());
    await waitFor(() => expect(semDados.result.current.carregando).toBe(false));
    expect(semDados.result.current.inscricoes).toEqual([]);

    listarMinhasInscricoes.mockRejectedValueOnce(new Error('falhou'));
    const comFalha = renderHook(() => useMyRegistrations());
    await waitFor(() => expect(comFalha.result.current.carregando).toBe(false));
    expect(comFalha.result.current.inscricoes).toEqual([]);
  });

  it('recarregar busca a lista de novo', async () => {
    listarMinhasInscricoes.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useMyRegistrations());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    listarMinhasInscricoes.mockResolvedValueOnce([{ id: 2 }]);
    await act(() => result.current.recarregar());

    expect(result.current.inscricoes).toEqual([{ id: 2 }]);
  });
});

describe('useFavoriteContests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('começa vazio quando não há nada salvo', () => {
    const { result } = renderHook(() => useFavoriteContests());
    expect(result.current.favoritos).toEqual([]);
  });

  it('restaura os favoritos salvos no localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2]));

    const { result } = renderHook(() => useFavoriteContests());

    expect(result.current.favoritos).toEqual([1, 2]);
    expect(result.current.ehFavorito(1)).toBe(true);
    expect(result.current.ehFavorito(3)).toBe(false);
  });

  it('começa vazio quando o valor salvo está corrompido', () => {
    localStorage.setItem(STORAGE_KEY, '{nao-e-json');

    const { result } = renderHook(() => useFavoriteContests());

    expect(result.current.favoritos).toEqual([]);
  });

  it('adiciona e remove favoritos, persistindo cada mudança', () => {
    const { result } = renderHook(() => useFavoriteContests());

    act(() => result.current.alternarFavorito(1));
    expect(result.current.favoritos).toEqual([1]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([1]);

    act(() => result.current.alternarFavorito(1));
    expect(result.current.favoritos).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([]);
  });

  it('continua funcionando em memória quando o localStorage está indisponível', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('indisponível');
    });

    const { result } = renderHook(() => useFavoriteContests());
    act(() => result.current.alternarFavorito(1));

    expect(result.current.favoritos).toEqual([1]);
  });
});
