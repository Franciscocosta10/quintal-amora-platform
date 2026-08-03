/**
 * lib/api.js
 *
 * Client HTTP único para toda a aplicação falar com a API Sails.
 * Centraliza: URL base, header Authorization automático (quando há
 * token salvo) e o formato de erro — assim cada tela só chama
 * `apiFetch(...)` e trata um `Error` com mensagem pronta para exibir.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';
const TOKEN_KEY = 'quintalAmora:token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * @param {string} path - ex: '/api/v1/auth/login'
 * @param {object} options
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [options.method]
 * @param {object} [options.body]
 * @param {boolean} [options.auth] - envia o token salvo? (default: true)
 */
export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const resposta = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    // resposta sem corpo (ex: 204) — segue sem dados
  }

  if (!resposta.ok) {
    const mensagem = dados?.error || 'Não foi possível completar a solicitação. Tente novamente.';
    throw new Error(mensagem);
  }

  return dados;
}
