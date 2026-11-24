import { useEffect, useState } from 'react';
import { listarAtividades } from '../services/schedule';

/**
 * useAtividades — busca a programação uma vez e filtra por dia no cliente:
 * a lista é pequena, então trocar de aba não precisa chamar a API de novo.
 */
export function useAtividades(eventoId) {
  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;

    // Sem setState síncrono no efeito (regra react-hooks/set-state-in-effect).
    listarAtividades(eventoId ? { eventoId } : {})
      .then((resultado) => {
        if (cancelado) return;
        setAtividades(resultado || []);
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

  return { atividades, carregando, erro };
}
