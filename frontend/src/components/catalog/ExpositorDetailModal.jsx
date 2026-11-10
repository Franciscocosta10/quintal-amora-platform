import { useEffect } from 'react';
import ExpositorImagem from './ExpositorImagem';
import { rotuloDoTipo } from './tiposExpositor';
import { REDES_SOCIAIS, ehLinkSeguro, rotuloDoLink } from '../../utils/redesSociais';
import './ExpositorCard.css';
import './ExpositorDetailModal.css';

/**
 * Detalhe do expositor (RF14). Usa o objeto que já veio na listagem — o
 * GET /expositor devolve todos os campos, então abrir o detalhe não custa
 * outra requisição. Fecha no "×", no Esc ou clicando fora do card.
 */
export default function ExpositorDetailModal({ expositor, isAdmin = false, onFechar, onEditar }) {
  useEffect(() => {
    if (!expositor) return undefined;

    function aoPressionarTecla(event) {
      if (event.key === 'Escape') onFechar?.();
    }

    document.addEventListener('keydown', aoPressionarTecla);
    return () => document.removeEventListener('keydown', aoPressionarTecla);
  }, [expositor, onFechar]);

  if (!expositor) return null;

  const redes = REDES_SOCIAIS
    .map((rede) => ({ ...rede, url: expositor.redesSociais?.[rede.chave] }))
    .filter((rede) => ehLinkSeguro(rede.url));

  function aoClicarNoFundo(event) {
    if (event.target === event.currentTarget) onFechar?.();
  }

  return (
    <div className="expositor-detail-overlay" onMouseDown={aoClicarNoFundo}>
      <div
        className="expositor-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expositor-detail-title"
      >
        <button
          type="button"
          className="expositor-detail__fechar"
          onClick={onFechar}
          aria-label="Fechar"
        >
          ×
        </button>

        <ExpositorImagem expositor={expositor} className="expositor-detail__imagem" />

        <div className="expositor-detail__corpo">
          <span className={`expositor-tipo expositor-tipo--${expositor.tipo}`}>
            {rotuloDoTipo(expositor.tipo)}
          </span>

          <h2 id="expositor-detail-title">{expositor.nome}</h2>

          {expositor.localizacaoEstande && (
            <p className="expositor-detail__estande">📍 {expositor.localizacaoEstande}</p>
          )}

          {expositor.descricao ? (
            <p className="expositor-detail__descricao">{expositor.descricao}</p>
          ) : (
            <p className="expositor-detail__descricao expositor-detail__descricao--vazia">
              Este expositor ainda não tem descrição.
            </p>
          )}

          {(expositor.contato || redes.length > 0) && (
            <div className="expositor-detail__contatos">
              {expositor.contato && (
                <div className="expositor-detail__contato">
                  <span>Contato</span>
                  <strong>{expositor.contato}</strong>
                </div>
              )}

              {redes.length > 0 && (
                <ul className="expositor-detail__redes">
                  {redes.map((rede) => (
                    <li key={rede.chave}>
                      <a href={rede.url} target="_blank" rel="noopener noreferrer">
                        <span>{rede.rotulo}</span>
                        {rotuloDoLink(rede.url)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="expositor-detail__acoes">
              <button
                type="button"
                className="expositor-card__editar"
                onClick={() => onEditar?.(expositor)}
              >
                Editar expositor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
