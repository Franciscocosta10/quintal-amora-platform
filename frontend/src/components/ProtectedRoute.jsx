/**
 * Envolve páginas que exigem login. Enquanto o AuthContext confere o
 * token salvo (`carregando`), não decide nada, para não piscar o login.
 *
 * Ao mandar para o login, guarda em `state.voltarPara` o endereço que a
 * pessoa tentou abrir (ex.: o link do QR do totem), para voltar depois.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return null;
  }

  if (!isAuthenticated) {
    const voltarPara = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ voltarPara }} />;
  }

  return children;
}
