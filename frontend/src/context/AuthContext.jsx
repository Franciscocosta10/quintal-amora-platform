/**
 * context/AuthContext.jsx
 *
 * Guarda quem está logado e expõe as ações de autenticação para o app
 * inteiro. Todo módulo futuro (Programação, Concursos...) só precisa
 * do hook `useAuth()` (em hooks/useAuth.js) para saber se tem alguém
 * logado e qual o perfil dele.
 *
 * `useAuth` fica em outro arquivo de propósito: o Fast Refresh do Vite
 * exige que um arquivo só exporte componentes quando possível, e este
 * arquivo já exporta o componente `AuthProvider`.
 */

import { useState, useEffect } from 'react';
import { apiFetch, getToken, setToken } from '../lib/api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app, se já existe um token salvo, confirma com a API
  // (via /auth/me) que ele ainda é válido antes de considerar logado.
  useEffect(() => {
    let cancelado = false;

    async function carregarUsuarioAtual() {
      const token = getToken();
      if (!token) {
        if (!cancelado) {
          setUsuario(null);
          setCarregando(false);
        }
        return;
      }
      try {
        const dados = await apiFetch('/api/v1/auth/me');
        if (!cancelado) {
          setUsuario(dados);
        }
      } catch {
        setToken(null);
        if (!cancelado) {
          setUsuario(null);
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    carregarUsuarioAtual();

    return () => {
      cancelado = true;
    };
  }, []);

  async function login(email, senha) {
    const dados = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: { email, senha },
      auth: false,
    });
    setToken(dados.token);
    setUsuario(dados.usuario);
    return dados.usuario;
  }

  async function cadastrar({ nomeCompleto, email, senha }) {
    const dados = await apiFetch('/api/v1/auth/signup', {
      method: 'POST',
      body: { nomeCompleto, email, senha },
      auth: false,
    });
    setToken(dados.token);
    setUsuario(dados.usuario);
    return dados.usuario;
  }

  async function logout() {
    try {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // mesmo se a chamada falhar, o token local é descartado abaixo
    }
    setToken(null);
    setUsuario(null);
  }

  const value = {
    usuario,
    carregando,
    isAuthenticated: !!usuario,
    login,
    cadastrar,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
