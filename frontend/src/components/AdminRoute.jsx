/**
 * Envolve páginas só de administradores (RNF07). Visitante logado volta
 * para a Home e quem não está logado vai para o login. A API também
 * bloqueia (policy isAdmin); isto só evita mostrar uma tela vazia.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, carregando } = useAuth();

  if (carregando) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
