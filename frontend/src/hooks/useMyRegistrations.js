import { useEffect, useState, useCallback } from 'react';
import { listarMinhasInscricoes } from '../services/Registration';

/**
 * useMyRegistrations — inscrições do usuário logado. A tela de Concursos
 * usa isso pra decidir qual botão mostrar ("Inscrever-se" x "Inscrito").
 * Expõe `recarregar` pra atualizar a lista logo após inscrever/cancelar,
 * sem precisar de reload da página inteira.
 */
export function useMyRegistrations() {
  const [inscricoes, setInscricoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    setCarregando(true);
    return listarMinhasInscricoes()
      .then((resultado) => setInscricoes(resultado || []))
      .catch(() => setInscricoes([]))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { inscricoes, carregando, recarregar: carregar };
}