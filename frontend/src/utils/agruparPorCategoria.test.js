import { describe, it, expect } from 'vitest';
import { agruparPorCategoria } from './agruparPorCategoria';

describe('agruparPorCategoria', () => {
  it('agrupa concursos pela categoria', () => {
    const concursos = [
      { id: 1, categoria: 'cosplay' },
      { id: 2, categoria: 'cosplay' },
      { id: 3, categoria: 'quiz' }
    ];

    const { categorias, porCategoria } = agruparPorCategoria(concursos);
    const chaves = categorias.map((c) => c.chave);

    expect(chaves).toContain('cosplay');
    expect(chaves).toContain('quiz');
    expect(porCategoria.cosplay).toHaveLength(2);
    expect(porCategoria.quiz).toHaveLength(1);
  });

  it('usa "outro" quando o concurso não tem categoria definida', () => {
    const concursos = [{ id: 1, categoria: null }];

    const { categorias, porCategoria } = agruparPorCategoria(concursos);

    expect(categorias.map((c) => c.chave)).toContain('outro');
    expect(porCategoria.outro).toHaveLength(1);
  });

  it('retorna listas vazias quando não há concursos', () => {
    const { categorias, porCategoria } = agruparPorCategoria([]);

    expect(categorias).toHaveLength(0);
    expect(porCategoria).toEqual({});
  });

  it('ordena as categorias alfabeticamente', () => {
    const concursos = [
      { id: 1, categoria: 'quiz' },
      { id: 2, categoria: 'cosplay' },
      { id: 3, categoria: 'desfile' }
    ];

    const { categorias } = agruparPorCategoria(concursos);

    expect(categorias.map((c) => c.chave)).toEqual(['cosplay', 'desfile', 'quiz']);
  });
});