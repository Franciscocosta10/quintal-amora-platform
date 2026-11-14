import ExpositorImagem from './ExpositorImagem';
import { MapPin } from 'lucide-react';
import { rotuloDoTipo } from './tiposExpositor';
import './ExpositorCard.css';

/**
 * Card do grid do catálogo. A área principal é um <button> (abre o
 * detalhe — RF14 — e funciona com teclado); o "Editar" do admin fica em
 * um botão separado, porque botão dentro de botão não é HTML válido.
 */
export default function ExpositorCard({ expositor, isAdmin = false, onAbrir, onEditar }) {
  return (
    <article className="expositor-card">
      <button
        type="button"
        className="expositor-card__principal"
        onClick={() => onAbrir?.(expositor)}
        aria-label={`Ver detalhes de ${expositor.nome}`}
      >
        <ExpositorImagem expositor={expositor} className="expositor-card__imagem" />

        <div className="expositor-card__corpo">
          <span className={`expositor-tipo expositor-tipo--${expositor.tipo}`}>
            {rotuloDoTipo(expositor.tipo)}
          </span>

          <span className="expositor-card__nome">{expositor.nome}</span>

          {expositor.localizacaoEstande && (
            <span className="expositor-card__estande com-icone"><MapPin size="1em" aria-hidden="true" /> {expositor.localizacaoEstande}</span>
          )}
        </div>
      </button>

      {isAdmin && (
        <div className="expositor-card__acoes">
          <button
            type="button"
            className="expositor-card__editar"
            onClick={() => onEditar?.(expositor)}
          >
            Editar
          </button>
        </div>
      )}
    </article>
  );
}
