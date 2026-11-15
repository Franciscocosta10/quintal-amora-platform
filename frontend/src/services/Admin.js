import { apiFetch } from '../lib/api';

// Dados gerais do evento atual para o painel administrativo (somente admin).
export function buscarPainelAdmin() {
  return apiFetch('/admin/dashboard');
}
