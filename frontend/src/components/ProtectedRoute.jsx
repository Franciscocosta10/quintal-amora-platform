/**
 * components/ProtectedRoute.jsx
 *
 * Envolve páginas que exigem login. Enquanto o AuthContext ainda está
 * conferindo o token salvo (carregando === true), não decide nada —
 * evita o "flash" de redirecionar para /login e depois voltar.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, carregando } = useAuth();

  if (carregando) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
