import { useEffect, useRef } from 'react';
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
  const fundoRef = useRef(null);

  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === 'Escape') onFechar();
    }

    function aoClicar(evento) {
      if (evento.target === fundoRef.current) onFechar();
    }

    document.addEventListener('keydown', aoPressionarTecla);
    document.addEventListener('click', aoClicar);
    return () => {
      document.removeEventListener('keydown', aoPressionarTecla);
      document.removeEventListener('click', aoClicar);
    };
  }, [onFechar]);

  return (
    <div className="modal-pagina" ref={fundoRef}>
      <div
        className="modal-pagina__cartao"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <button type="button" className="modal-pagina__fechar" onClick={onFechar} aria-label="Fechar">
          <X size={20} aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}
