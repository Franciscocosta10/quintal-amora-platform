import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'quintalAmora:atividadesFavoritas';

/**
 * useFavoriteAtividades — mesmo mecanismo do useFavoriteContests
 * agora aplicado à Programação, que tinha
 * a UI (DayTabs/ScheduleItem) pronta mas nunca recebia os dados.
 */
export function useFavoriteAtividades() {
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

  const alternarFavorito = useCallback((atividadeId) => {
    setFavoritos((atual) =>
      atual.includes(atividadeId)
        ? atual.filter((id) => id !== atividadeId)
        : [...atual, atividadeId]
    );
  }, []);

  const ehFavorito = useCallback(
    (atividadeId) => favoritos.includes(atividadeId),
    [favoritos]
  );

  return { favoritos, alternarFavorito, ehFavorito };
}