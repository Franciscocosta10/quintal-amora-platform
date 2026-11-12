import { paginasVisiveis } from '../utils/paginacao';
import './Pagination.css';

/**
 * Paginação genérica: "← Anterior 1 2 3 … 10 Próximo →".
 * Não guarda estado — quem usa controla a página atual. Com uma página só
 * não renderiza nada.
 */
export default function Pagination({ paginaAtual, totalPaginas, onMudarPagina, className = '' }) {
  if (totalPaginas <= 1) return null;

  const naPrimeira = paginaAtual === 1;
  const naUltima = paginaAtual === totalPaginas;

  return (
    <nav className={`paginacao ${className}`.trim()} aria-label="Paginação">
      <button
        type="button"
        className="paginacao__seta"
        aria-label="Página anterior"
        disabled={naPrimeira}
        onClick={() => onMudarPagina(paginaAtual - 1)}
      >
        <span aria-hidden="true">←</span>
        <span className="paginacao__rotulo">Anterior</span>
      </button>

      <ul className="paginacao__paginas">
        {paginasVisiveis(paginaAtual, totalPaginas).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={`paginacao__pagina ${item === paginaAtual ? 'is-active' : ''}`}
                aria-label={`Página ${item}`}
                aria-current={item === paginaAtual ? 'page' : undefined}
                onClick={() => onMudarPagina(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="paginacao__reticencias" aria-hidden="true">
              …
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        className="paginacao__seta"
        aria-label="Próxima página"
        disabled={naUltima}
        onClick={() => onMudarPagina(paginaAtual + 1)}
      >
        <span className="paginacao__rotulo">Próximo</span>
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
