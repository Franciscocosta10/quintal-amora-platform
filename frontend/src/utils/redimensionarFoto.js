/**
 * Recorta a foto no centro (quadrado) e reduz para `tamanho` x `tamanho`,
 * devolvendo uma data URL JPEG. Assim uma foto de celular de vários MB
 * vira ~30 KB antes de ir para o backend (ver auth/change-photo).
 */
export function redimensionarFoto(arquivo, tamanho = 256, qualidade = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const imagem = new Image();

    imagem.onload = () => {
      URL.revokeObjectURL(url);
      const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight);
      const x = (imagem.naturalWidth - lado) / 2;
      const y = (imagem.naturalHeight - lado) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = tamanho;
      canvas.height = tamanho;
      const contexto = canvas.getContext('2d');
      // Fundo branco: PNG transparente não fica preto ao virar JPEG.
      contexto.fillStyle = '#ffffff';
      contexto.fillRect(0, 0, tamanho, tamanho);
      contexto.drawImage(imagem, x, y, lado, lado, 0, 0, tamanho, tamanho);
      resolve(canvas.toDataURL('image/jpeg', qualidade));
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler essa imagem.'));
    };

    imagem.src = url;
  });
}
