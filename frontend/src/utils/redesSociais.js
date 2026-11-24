/**
 * Converte o que o admin digita nas redes sociais ("@loja",
 * "loja.com.br") em URL antes de enviar, porque o backend só aceita
 * http(s). Também faz o caminho inverso, para exibir um rótulo curto.
 */

export const REDES_SOCIAIS = [
  { chave: 'instagram', rotulo: 'Instagram', dominio: 'instagram.com', base: 'https://instagram.com/', placeholder: '@sualoja' },
  { chave: 'youtube', rotulo: 'YouTube', dominio: 'youtube.com', base: 'https://www.youtube.com/@', placeholder: '@seucanal' },
  { chave: 'tiktok', rotulo: 'TikTok', dominio: 'tiktok.com', base: 'https://www.tiktok.com/@', placeholder: '@sualoja' },
  { chave: 'site', rotulo: 'Site', dominio: null, base: null, placeholder: 'sualoja.com.br' }
];

const PROTOCOLO_HTTP = /^https?:\/\//i;

/**
 * Converte o que o admin digitou em URL:
 *  - URL completa                     → mantida
 *  - "instagram.com/loja" (sem https) → "https://instagram.com/loja"
 *  - "@loja" ou "loja.da.amora"       → URL do perfil na rede
 *  - site "loja.com.br"               → "https://loja.com.br"
 * Vazio vira ''.
 */
export function normalizarLinkRede(chave, valor) {
  const texto = (valor || '').trim();
  if (!texto) return '';

  if (PROTOCOLO_HTTP.test(texto)) return texto;

  const rede = REDES_SOCIAIS.find((r) => r.chave === chave);

  if (rede?.base && !texto.toLowerCase().includes(rede.dominio)) {
    return rede.base + texto.replace(/^@/, '');
  }

  return `https://${texto}`;
}

/** Texto curto para exibir o link: "instagram.com/loja" em vez da URL inteira. */
export function rotuloDoLink(url) {
  return url.replace(PROTOCOLO_HTTP, '').replace(/^www\./, '').replace(/\/$/, '');
}

/** Só renderiza links http(s) — segunda barreira, além da validação do backend. */
export function ehLinkSeguro(url) {
  return typeof url === 'string' && PROTOCOLO_HTTP.test(url);
}
