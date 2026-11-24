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

    // Sem setState síncrono no efeito (regra react-hooks/set-state-in-effect).
    listarConcursos(eventoId ? { eventoId } : {})
      .then((resultado) => {
        if (cancelado) return;
        setConcursos(resultado || []);
        setErro(null);
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