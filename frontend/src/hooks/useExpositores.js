import { useCallback, useEffect, useState } from 'react';
import { listarExpositores } from '../services/Expositor';

/**
 * useExpositores — busca o catálogo uma vez; filtros por tipo e busca por
 * nome acontecem no cliente (o catálogo de uma edição tem dezenas de
 * expositores, não milhares).
 *
 * Diferente do useContests, expõe `recarregar`: depois de criar, editar
 * ou excluir, a página atualiza só a lista — sem `window.location.reload()`,
 * então a aba e a busca que o admin estava usando continuam lá.
 */
export function useExpositores() {
  const [expositores, setExpositores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Nenhum setState síncrono aqui (regra react-hooks/set-state-in-effect):
  // o erro só é limpo quando a nova resposta chega. Também não volta para
  // "carregando" ao recarregar — o grid atual fica na tela até a nova lista.
  const carregar = useCallback(() => {
    return listarExpositores()
      .then((resultado) => {
        setExpositores(resultado || []);
        setErro(null);
      })
      .catch((err) => setErro(err))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { expositores, carregando, erro, recarregar: carregar };
}
