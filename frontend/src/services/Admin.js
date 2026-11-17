import { apiFetch } from '../lib/api';

// Dados gerais do evento atual para o painel administrativo (somente admin).
export function buscarPainelAdmin() {
  return apiFetch('/admin/dashboard');
}

// Gerenciamento de usuários (RF17) — somente admin.
export function listarUsuarios() {
  return apiFetch('/admin/users');
}

export function adicionarUsuario(dados) {
  return apiFetch('/admin/users', { method: 'POST', body: dados });
}

// `alteracoes`: { ativo } para desativar/reativar ou { perfil } para trocar o perfil.
export function alterarUsuario(id, alteracoes) {
  return apiFetch(`/admin/users/${id}`, { method: 'PUT', body: alteracoes });
}
