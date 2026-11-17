import { api } from './scheduleApi';
import { apiFetch } from '../lib/api';

// Dados do evento atual (o mais recente). Usado na Home, no check-in e no
// formulário do Painel admin. Retorna null se nenhum evento foi cadastrado.
export function buscarEventoAtual() {
  return api.get('/event/actual-find');
}

// Cria o evento (se ainda não existir) ou edita o atual — somente admin.
export function salvarEvento(dados) {
  return apiFetch('/event/save', {
    method: 'PUT',
    body: dados,
  });
}
