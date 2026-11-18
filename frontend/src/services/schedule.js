/**
 * schedule.js
 *
 * Funções que conversam com os endpoints de /activity (RF06 e RF07).
 */

import { apiFetch } from '../lib/api';

/**
 * RF06 — lista a programação, com filtros opcionais.
 * @param {{ eventoId?: number, dia?: string, destaque?: boolean, limit?: number }} filtros
 */
export function listarAtividades(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.eventoId) params.set('eventoId', filtros.eventoId);
  if (filtros.dia) params.set('dia', filtros.dia);
  if (filtros.destaque !== undefined) {
    params.set('destaque', filtros.destaque);
  }
  if (filtros.limit) params.set('limit', filtros.limit);

  const query = params.toString();

  return apiFetch(`/activity${query ? `?${query}` : ''}`);
}

// RF07 — usadas pelo admin na tela de Programação.
export function criarAtividade(dados) {
  return apiFetch('/activity/create', { method: 'POST', body: dados });
}

export function editarAtividade(id, dados) {
  return apiFetch(`/activity/update/${id}`, { method: 'PUT', body: dados });
}

export function removerAtividade(id) {
  return apiFetch(`/activity/delete/${id}`, { method: 'DELETE' });
}