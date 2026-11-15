import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { redimensionarFoto } from './redimensionarFoto';

// jsdom não carrega imagens nem desenha em canvas: simulamos os dois.
let comportamento;
let contexto;

class ImagemFalsa {
  constructor() {
    this.naturalWidth = 400;
    this.naturalHeight = 300;
  }

  set src(_url) {
    setTimeout(() => (comportamento === 'erro' ? this.onerror() : this.onload()));
  }
}

beforeEach(() => {
  comportamento = 'ok';
  contexto = { fillRect: vi.fn(), drawImage: vi.fn() };
  vi.stubGlobal('Image', ImagemFalsa);
  URL.createObjectURL = vi.fn(() => 'blob:foto');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(contexto);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,OK');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('redimensionarFoto', () => {
  it('recorta o centro em quadrado, reduz e devolve JPEG', async () => {
    const resultado = await redimensionarFoto(new File(['x'], 'foto.png'), 256, 0.8);

    expect(resultado).toBe('data:image/jpeg;base64,OK');
    // 400x300 → quadrado de 300 começando em x=50.
    expect(contexto.drawImage).toHaveBeenCalledWith(expect.any(ImagemFalsa), 50, 0, 300, 300, 0, 0, 256, 256);
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:foto');
  });

  it('rejeita quando a imagem não pode ser lida', async () => {
    comportamento = 'erro';

    await expect(redimensionarFoto(new File(['x'], 'quebrada.png'))).rejects.toThrow('Não foi possível ler essa imagem.');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:foto');
  });
});
