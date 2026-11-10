// Rótulos dos tipos de expositor (mesmos valores do `isIn` do model).
export const TIPOS_EXPOSITOR = {
  loja: { rotulo: 'Loja', plural: 'Lojas' },
  artista: { rotulo: 'Artista', plural: 'Artistas' }
};

export function rotuloDoTipo(tipo) {
  return TIPOS_EXPOSITOR[tipo]?.rotulo || tipo;
}

/** Iniciais exibidas quando o expositor não tem imagem (ou ela não carrega). */
export function iniciaisDoNome(nome = '') {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return '?';

  const primeira = palavras[0][0];
  const ultima = palavras.length > 1 ? palavras[palavras.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}
