import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAtividades } from './useSchedule';
import { listarAtividades } from '../services/schedule';

vi.mock('../services/schedule', () => ({ listarAtividades: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAtividades', () => {
  it('busca a programação sem filtro quando não há eventoId', async () => {
    listarAtividades.mockResolvedValue([{ id: 1, titulo: 'Abertura' }]);

    const { result } = renderHook(() => useAtividades());
    expect(result.current.carregando).toBe(true);

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(listarAtividades).toHaveBeenCalledWith({});
    expect(result.current.atividades).toEqual([{ id: 1, titulo: 'Abertura' }]);
    expect(result.current.erro).toBeNull();
  });

  it('filtra pelo eventoId e busca de novo quando ele muda', async () => {
    listarAtividades.mockResolvedValue([]);

    const { result, rerender } = renderHook(({ eventoId }) => useAtividades(eventoId), {
      initialProps: { eventoId: 5 }
    });
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(listarAtividades).toHaveBeenLastCalledWith({ eventoId: 5 });

    rerender({ eventoId: 6 });
    await waitFor(() => expect(listarAtividades).toHaveBeenLastCalledWith({ eventoId: 6 }));
  });

  it('usa lista vazia quando a API não retorna dados', async () => {
    listarAtividades.mockResolvedValue(null);

    const { result } = renderHook(() => useAtividades());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.atividades).toEqual([]);
  });

  it('expõe o erro e o limpa quando uma nova busca dá certo', async () => {
    const falha = new Error('falhou');
    listarAtividades.mockRejectedValueOnce(falha);

    const { result, rerender } = renderHook(({ eventoId }) => useAtividades(eventoId), {
      initialProps: { eventoId: 1 }
    });
    await waitFor(() => expect(result.current.erro).toBe(falha));
    expect(result.current.carregando).toBe(false);

    listarAtividades.mockResolvedValueOnce([{ id: 2 }]);
    rerender({ eventoId: 2 });

    await waitFor(() => expect(result.current.atividades).toEqual([{ id: 2 }]));
    expect(result.current.erro).toBeNull();
  });

  it('ignora a resposta que chega depois de desmontar', async () => {
    let resolver;
    listarAtividades.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));

    const { result, unmount } = renderHook(() => useAtividades());
    unmount();

    await act(async () => resolver([{ id: 1 }]));
    expect(result.current.atividades).toEqual([]);
    expect(result.current.carregando).toBe(true);
  });
});
