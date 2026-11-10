import { apiFetch } from '../lib/api';

// Catálogo de lojas e artistas (RF13–RF15). Mesmo formato de
// services/Contest.js; a listagem e o detalhe são públicos.

export function listarExpositores(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const query = params ? `?${params}` : '';

  return apiFetch(`/expositor${query}`, { auth: false });
}

export function criarExpositor(dados) {
  return apiFetch('/expositor/create', {
    method: 'POST',
    body: dados,
  });
}

export function editarExpositor(id, dados) {
  return apiFetch(`/expositor/update/${id}`, {
    method: 'PUT',
    body: dados,
  });
}

export function removerExpositor(id) {
  return apiFetch(`/expositor/destroy/${id}`, {
    method: 'DELETE',
  });
}
