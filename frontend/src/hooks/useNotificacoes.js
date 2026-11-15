import { useCallback, useEffect, useState } from 'react';
import { listarNotificacoes } from '../services/Notificacao';

/**
 * useNotificacoes — busca os avisos e repete a busca a cada 20 segundos
 * (polling), para avisos novos aparecerem sem recarregar a página.
 *
 * "Não lida" = aviso criado depois da última vez que a pessoa abriu o
 * sino. Esse horário fica no localStorage do navegador, então não precisa
 * de tabela de leitura no banco.
 */

export const INTERVALO_ATUALIZACAO_MS = 20000;
const CHAVE_ULTIMA_VISTA = 'quintalAmora:notificacoesVistasEm';

function lerUltimaVista() {
  try {
    return Number(localStorage.getItem(CHAVE_ULTIMA_VISTA)) || 0;
  } catch {
    return 0;
  }
}

function salvarUltimaVista(timestamp) {
  try {
    localStorage.setItem(CHAVE_ULTIMA_VISTA, String(timestamp));
  } catch {
    // sem localStorage (ex.: navegação privada): só não lembra entre visitas
  }
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [ultimaVista, setUltimaVista] = useState(lerUltimaVista);

  // Nenhum setState síncrono aqui (regra react-hooks/set-state-in-effect).
  // Se uma busca falhar, a lista atual continua na tela e a próxima
  // tentativa acontece no intervalo seguinte.
  const carregar = useCallback(() => {
    return listarNotificacoes()
      .then((resultado) => setNotificacoes(resultado || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [carregar]);

  const naoLidas = notificacoes.filter((notificacao) => notificacao.createdAt > ultimaVista).length;

  // Marca como vistas até o aviso mais novo da lista (não usa o relógio do
  // navegador, que pode estar diferente do servidor).
  function marcarComoVistas() {
    const maisNova = notificacoes[0]?.createdAt;
    if (maisNova && maisNova > ultimaVista) {
      setUltimaVista(maisNova);
      salvarUltimaVista(maisNova);
    }
  }

  return { notificacoes, naoLidas, ultimaVista, marcarComoVistas };
}
