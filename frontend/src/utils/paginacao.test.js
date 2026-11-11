import { describe, it, expect } from 'vitest';
import { paginasVisiveis } from './paginacao';

describe('paginasVisiveis', () => {
  it('mostra todas as páginas quando são até 7', () => {
    expect(paginasVisiveis(1, 1)).toEqual([1]);
    expect(paginasVisiveis(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('nas pontas mantém três números juntos', () => {
    expect(paginasVisiveis(1, 10)).toEqual([1, 2, 3, 'reticencias-fim', 10]);
    expect(paginasVisiveis(2, 10)).toEqual([1, 2, 3, 'reticencias-fim', 10]);
    expect(paginasVisiveis(9, 10)).toEqual([1, 'reticencias-inicio', 8, 9, 10]);
    expect(paginasVisiveis(10, 10)).toEqual([1, 'reticencias-inicio', 8, 9, 10]);
  });

  it('no meio mostra a atual com as vizinhas e reticências dos dois lados', () => {
    expect(paginasVisiveis(5, 10)).toEqual([1, 'reticencias-inicio', 4, 5, 6, 'reticencias-fim', 10]);
  });

  it('troca "…" pelo número quando o buraco é de uma página só', () => {
    expect(paginasVisiveis(4, 10)).toEqual([1, 2, 3, 4, 5, 'reticencias-fim', 10]);
    expect(paginasVisiveis(7, 10)).toEqual([1, 'reticencias-inicio', 6, 7, 8, 9, 10]);
  });
});
