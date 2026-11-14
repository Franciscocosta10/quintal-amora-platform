import { apiFetch } from '../lib/api';

// `foto` é uma data URL (ver utils/redimensionarFoto) ou null para remover.
export function atualizarFotoPerfil(foto) {
  return apiFetch('/auth/change-photo', { method: 'PUT', body: { fotoPerfil: foto } });
}

export function atualizarDadosPerfil({ nomeCompleto, email }) {
  return apiFetch('/auth/update-profile', { method: 'PUT', body: { nomeCompleto, email } });
}
