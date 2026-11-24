import { apiFetch } from '../lib/api';

export async function registrarCheckin(qrCode) {
  return apiFetch('/checkin', {
    method: 'POST',
    body: { qrCode },
  });
}

export async function consultarStatusCheckin(eventoId) {
  // Só aceita um id numérico: outro valor poderia mudar o caminho chamado.
  const id = Number(eventoId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Evento inválido.');
  }

  return apiFetch(`/checkin/status/${id}`, {
    method: 'GET',
  });
}

export async function consultarHistoricoCheckins() {
  return apiFetch('/checkin/historico', {
    method: 'GET',
  });
}