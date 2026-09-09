import { apiFetch } from '../lib/api';

export async function registrarCheckin(qrCode) {
  return apiFetch('/checkin', {
    method: 'POST',
    body: { qrCode },
  });
}

export async function consultarStatusCheckin(eventoId) {
  return apiFetch(`/checkin/status/${eventoId}`, {
    method: 'GET',
  });
}

export async function consultarHistoricoCheckins() {
  return apiFetch('/checkin/historico', {
    method: 'GET',
  });
}