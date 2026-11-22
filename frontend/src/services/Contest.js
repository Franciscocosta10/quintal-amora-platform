import { apiFetch } from '../lib/api';

export function listarConcursos(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const query = params ? `?${params}` : '';

  return apiFetch(`/contest${query}`);
}

export function criarConcurso(dados) {
  return apiFetch('/contest/create', {
    method: 'POST',
    body: dados,
  });
}

export function editarConcurso(id, dados) {
  return apiFetch(`/contest/update/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: dados,
  });
}

export function removerConcurso(id) {
  return apiFetch(`/contest/delete/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}