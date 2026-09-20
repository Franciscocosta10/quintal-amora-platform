/**
 * api.js
 *
 * Wrapper fino sobre `fetch` para centralizar:
 *  - a base URL (vem de VITE_API_URL, conforme já definido no seu .env)
 *  - o header Authorization com o JWT (RF01-RF03), quando existir
 *  - tratamento de erro padrão (lança um Error com a mensagem da API)
 *
 * ATENÇÃO: ajuste a chave 'quintal_amora_token' abaixo se o seu fluxo de
 * login (RF01-RF03) já salva o JWT no localStorage com outro nome.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';
const TOKEN_STORAGE_KEY = 'quintalAmora:token';

function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = body?.message || `Erro ${response.status} ao acessar ${path}`;
    throw new Error(message);
  }

  return body;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' })
};
