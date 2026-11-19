import { useEffect, useState } from 'react';
import { listarAtividades } from '../services/schedule';

/**
 * useAtividades — busca a programação UMA vez e deixa o filtro por dia
 * (abas "Todos / Sábado / Domingo") acontecer no cliente, em memória.
 *
 * Por que filtrar no cliente em vez de rechamar a API a cada clique de aba?
 * -> A programação de um evento é uma lista pequena (dezenas de itens, não
 *    milhares) e não muda a cada segundo, então trocar de aba não precisa
 *    de round-trip ao backend. Isso deixa a troca de aba instantânea e
 *    evita ficar martelando o RF06 (`GET /atividades`) a cada clique.
 */
export function useAtividades(eventoId) {
  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;

    // Nenhum setState síncrono aqui (regra react-hooks/set-state-in-effect):
    // o erro só é limpo quando a nova resposta chega, e a lista atual fica
    // na tela até a nova chegar (mesmo padrão do useExpositores).
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
