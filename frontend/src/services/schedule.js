/**
 * schedule.js
 *
 * Funções que conversam com os endpoints de /activity (RF06 e RF07).
 */

import { api } from './scheduleApi';

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

  return api.get(`/activity${query ? `?${query}` : ''}`);
}

// RF07 — usadas na futura tela de administração de programação.
export function criarAtividade(dados) {
  return api.post('/activity/create', dados);
}

export function editarAtividade(id, dados) {
  return api.put(`/activity/update/${id}`, dados);
}

export function removerAtividade(id) {
  return api.delete(`/activity/delete/${id}`);
}