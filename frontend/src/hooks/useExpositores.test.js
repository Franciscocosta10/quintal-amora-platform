import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useExpositores } from './useExpositores';
import { listarExpositores } from '../services/Expositor';

vi.mock('../services/Expositor', () => ({ listarExpositores: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useExpositores', () => {
  it('busca o catálogo ao montar', async () => {
    listarExpositores.mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useExpositores());
    expect(result.current.carregando).toBe(true);

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.expositores).toEqual([{ id: 1 }]);
    expect(result.current.erro).toBeNull();
  });

  it('trata resposta vazia (null) como lista vazia', async () => {
    listarExpositores.mockResolvedValue(null);

    const { result } = renderHook(() => useExpositores());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.expositores).toEqual([]);
  });

  it('expõe o erro quando a busca falha', async () => {
    const falha = new Error('fora do ar');
    listarExpositores.mockRejectedValue(falha);

    const { result } = renderHook(() => useExpositores());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.erro).toBe(falha);
  });

  it('recarregar busca de novo e limpa o erro anterior', async () => {
    listarExpositores.mockRejectedValueOnce(new Error('fora do ar'));

    const { result } = renderHook(() => useExpositores());
    await waitFor(() => expect(result.current.erro).not.toBeNull());

    listarExpositores.mockResolvedValueOnce([{ id: 2 }]);
    await act(() => result.current.recarregar());

    expect(result.current.expositores).toEqual([{ id: 2 }]);
    expect(result.current.erro).toBeNull();
  });
});
