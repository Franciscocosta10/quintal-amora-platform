import { apiFetch } from '../lib/api';

// Últimos avisos do evento (rota pública).
export function listarNotificacoes() {
  return apiFetch('/notificacao', { auth: false });
}

// Envia um aviso para os participantes (somente admin).
export function enviarNotificacao(dados) {
  return apiFetch('/notificacao/create', {
    method: 'POST',
    body: dados,
  });
}
