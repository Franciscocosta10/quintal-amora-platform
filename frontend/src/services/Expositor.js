import { apiFetch } from '../lib/api';

// Catálogo de lojas e artistas (RF13–RF15); listagem e detalhe são públicos.

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
  return apiFetch(`/expositor/update/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: dados,
  });
}

export function removerExpositor(id) {
  return apiFetch(`/expositor/destroy/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
