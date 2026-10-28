import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'quintalAmora:concursosFavoritos';

/**
 * useFavoriteContests — favoritos de Concursos guardados no localStorage
 * do navegador. ASSUMI esse mecanismo por não ter acesso ao hook real de
 * favoritos de Programação — se lá for diferente (ex.: backend), avisa
 * que eu troco a implementação pra bater.
 */
export function useFavoriteContests() {
  const [favoritos, setFavoritos] = useState(() => {
    try {
      const salvos = localStorage.getItem(STORAGE_KEY);
      return salvos ? JSON.parse(salvos) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
    } catch {
      // localStorage indisponível (ex.: modo privado) — ignora
    }
  }, [favoritos]);

  const alternarFavorito = useCallback((concursoId) => {
    setFavoritos((atual) =>
      atual.includes(concursoId)
        ? atual.filter((id) => id !== concursoId)
        : [...atual, concursoId]
    );
  }, []);

  const ehFavorito = useCallback(
    (concursoId) => favoritos.includes(concursoId),
    [favoritos]
  );

  return { favoritos, alternarFavorito, ehFavorito };
}