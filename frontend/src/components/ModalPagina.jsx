import { useEffect } from 'react';
import { X } from 'lucide-react';
import './ModalPagina.css';

/**
 * ModalPagina — tela que abre por cima do sistema (Perfil, Trocar foto).
 *
 * O fundo é a própria tela de onde o usuário veio, desfocada (ver App.jsx),
 * para ele não sentir que saiu do sistema. Fecha pelo X, pelo Esc ou
 * clicando fora do cartão.
 */
export default function ModalPagina({ titulo, onFechar, children }) {
  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === 'Escape') onFechar();
    }

    document.addEventListener('keydown', aoPressionarTecla);
    return () => document.removeEventListener('keydown', aoPressionarTecla);
  }, [onFechar]);

  return (
    <div className="modal-pagina" onClick={onFechar}>
      <div
        className="modal-pagina__cartao"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
      >
        <button type="button" className="modal-pagina__fechar" onClick={onFechar} aria-label="Fechar">
          <X size={20} aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}
