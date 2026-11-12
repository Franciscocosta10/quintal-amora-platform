import { describe, it, expect } from 'vitest';
import { REDES_SOCIAIS, ehLinkSeguro, normalizarLinkRede, rotuloDoLink } from './redesSociais';

describe('utils/redesSociais', () => {
  it('lista as mesmas redes aceitas pelo backend', () => {
    expect(REDES_SOCIAIS.map((r) => r.chave)).toEqual(['instagram', 'youtube', 'tiktok', 'site']);
  });

  describe('normalizarLinkRede', () => {
    it('devolve vazio para valor vazio, só com espaços ou ausente', () => {
      expect(normalizarLinkRede('instagram', '')).toBe('');
      expect(normalizarLinkRede('instagram', '   ')).toBe('');
      expect(normalizarLinkRede('instagram', undefined)).toBe('');
    });

    it('mantém URLs completas', () => {
      expect(normalizarLinkRede('instagram', ' https://instagram.com/loja ')).toBe('https://instagram.com/loja');
      expect(normalizarLinkRede('site', 'http://loja.com')).toBe('http://loja.com');
    });

    it('converte @usuario em URL do perfil, inclusive com ponto no nome', () => {
      expect(normalizarLinkRede('instagram', '@studio.kitsune')).toBe('https://instagram.com/studio.kitsune');
      expect(normalizarLinkRede('instagram', 'lojageek')).toBe('https://instagram.com/lojageek');
      expect(normalizarLinkRede('tiktok', '@rafa')).toBe('https://www.tiktok.com/@rafa');
      expect(normalizarLinkRede('youtube', '@lojageek')).toBe('https://www.youtube.com/@lojageek');
    });

    it('completa o protocolo quando o domínio da rede já foi digitado', () => {
      expect(normalizarLinkRede('instagram', 'Instagram.com/loja')).toBe('https://Instagram.com/loja');
      expect(normalizarLinkRede('youtube', 'www.youtube.com/@loja')).toBe('https://www.youtube.com/@loja');
    });

    it('completa o protocolo do site', () => {
      expect(normalizarLinkRede('site', 'loja.com.br')).toBe('https://loja.com.br');
    });
  });

  it('rotuloDoLink remove protocolo, www e barra final', () => {
    expect(rotuloDoLink('https://www.instagram.com/loja/')).toBe('instagram.com/loja');
    expect(rotuloDoLink('http://loja.com.br')).toBe('loja.com.br');
  });

  it('ehLinkSeguro só aceita textos http(s)', () => {
    expect(ehLinkSeguro('https://loja.com')).toBe(true);
    expect(ehLinkSeguro('javascript:alert(1)')).toBe(false);
    expect(ehLinkSeguro(null)).toBe(false);
    expect(ehLinkSeguro(undefined)).toBe(false);
  });
});
