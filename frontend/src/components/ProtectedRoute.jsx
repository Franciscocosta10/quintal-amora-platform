/**
 * components/ProtectedRoute.jsx
 *
 * Envolve páginas que exigem login. Enquanto o AuthContext ainda está
 * conferindo o token salvo (carregando === true), não decide nada —
 * evita o "flash" de redirecionar para /login e depois voltar.
 *
 * Ao mandar para o login, guarda em `state.voltarPara` o endereço que a
 * pessoa tentou abrir (ex: o link do QR Code do totem,
 * /checkin?qr=...). Depois de entrar ou se cadastrar, ela volta para lá.
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
