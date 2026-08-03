/**
 * hooks/useAuth.js
 *
 * Hook de acesso ao AuthContext. Uso em qualquer componente:
 *   const { usuario, isAuthenticated, login, cadastrar, logout } = useAuth();
 */

import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>.');
  }
  return contexto;
}
