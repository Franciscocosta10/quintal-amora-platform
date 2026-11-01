import { apiFetch } from '../lib/api';

export function inscreverEmConcurso(concursoId) {
  return apiFetch(`/contest/${concursoId}/register`, {
    method: 'POST',
    body: {},
  });
}

export function cancelarInscricao(id) {
  return apiFetch(`/registration/${id}`, {
    method: 'DELETE',
  });
}

export function listarMinhasInscricoes() {
  return apiFetch('/registration/mine');
}

export function listarInscritosDoConcurso(concursoId) {
  return apiFetch(`/contest/${concursoId}/registrations`);
}