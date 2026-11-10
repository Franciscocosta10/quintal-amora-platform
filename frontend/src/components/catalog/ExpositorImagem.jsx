import { useState } from 'react';
import { iniciaisDoNome } from './tiposExpositor';
import { ehLinkSeguro } from '../../utils/redesSociais';

/**
 * Imagem do expositor com fallback: sem URL, com URL não-http(s) ou com
 * imagem quebrada (link externo que saiu do ar), mostra as iniciais sobre
 * o mesmo degradê do banner da Home — o grid nunca fica com "buraco".
 */
export default function ExpositorImagem({ expositor, className = '' }) {
  // Guarda QUAL url falhou (e não só um booleano): se o admin trocar a
  // imagem quebrada por outra, a nova é tentada sem precisar de efeito.
  const [urlQueFalhou, setUrlQueFalhou] = useState(null);
  const temImagem = ehLinkSeguro(expositor.imagem) && urlQueFalhou !== expositor.imagem;

  if (temImagem) {
    return (
      <img
        className={`expositor-imagem ${className}`}
        src={expositor.imagem}
        alt={`Imagem de ${expositor.nome}`}
        loading="lazy"
        onError={() => setUrlQueFalhou(expositor.imagem)}
      />
    );
  }

  return (
    <div className={`expositor-imagem expositor-imagem--placeholder ${className}`} aria-hidden="true">
      {iniciaisDoNome(expositor.nome)}
    </div>
  );
}
