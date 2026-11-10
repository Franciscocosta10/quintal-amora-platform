/**
 * utils/redesSociais.js
 *
 * O backend só aceita URLs http(s) nas redes sociais (proteção contra
 * links `javascript:` no catálogo público). Mas, na prática, o admin
 * digita "@lojadaamora" ou "lojadaamora.com.br". Este módulo converte o
 * que foi digitado em URL antes de enviar, e o caminho inverso (URL →
 * rótulo curto) para exibir no detalhe do expositor.
 */

export const REDES_SOCIAIS = [
  { chave: 'instagram', rotulo: 'Instagram', dominio: 'instagram.com', base: 'https://instagram.com/', placeholder: '@sualoja' },
  { chave: 'facebook', rotulo: 'Facebook', dominio: 'facebook.com', base: 'https://facebook.com/', placeholder: 'sualoja' },
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
