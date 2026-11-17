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

// RF10 — lista de participantes de um concurso (somente admin).
export function listarInscritosDoConcurso(concursoId) {
  return apiFetch(`/contest/${concursoId}/registrations`);
}

// RF10 — admin marca/desmarca quem compareceu ao concurso.
export function marcarPresenca(id, presencaConfirmada) {
  return apiFetch(`/registration/${id}/presence`, {
    method: 'PUT',
    body: { presencaConfirmada },
  });
}