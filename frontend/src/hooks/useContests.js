import { useEffect, useState } from 'react';
import { listarConcursos } from '../services/Contest';

/**
 * useContests — busca os concursos uma vez; o filtro por categoria
 * acontece no cliente, mesmo raciocínio do useAtividades.
 */
export function useContests(eventoId) {
  const [concursos, setConcursos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;

    setCarregando(true);
    setErro(null);

    listarConcursos(eventoId ? { eventoId } : {})
      .then((resultado) => {
        if (!cancelado) setConcursos(resultado || []);
      })
      .catch((err) => {
        if (!cancelado) setErro(err);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [eventoId]);

  return { concursos, carregando, erro };
}