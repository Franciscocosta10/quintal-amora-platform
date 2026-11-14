import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Fecha uma tela aberta como modal (Perfil, Trocar foto).
 *
 * Aberta pelo menu do usuário, a tela de trás está guardada em
 * `location.state.background`: voltar no histórico devolve o usuário
 * exatamente para ela. Acessada direto pela URL, não há para onde voltar
 * dentro do sistema, então vai para a Home (`/home` — a rota `/` é o login).
 */
export function useFecharModalPagina() {
  const location = useLocation();
  const navigate = useNavigate();
  const abertaPorCima = Boolean(location.state?.background);

  return useCallback(() => {
    if (abertaPorCima) navigate(-1);
    else navigate('/home');
  }, [abertaPorCima, navigate]);
}
