import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificacoes } from '../hooks/useNotificacoes';
import { TIPOS_NOTIFICACAO } from './tiposNotificacao';
import './NotificationBell.css';

/**
 * Sino do Header (RF11). Mostra quantos avisos ainda não foram vistos e,
 * ao clicar, a lista dos últimos avisos. Abrir a lista marca tudo como
 * visto. Os avisos novos chegam pelo polling do useNotificacoes.
 */

function formatarQuando(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

export default function NotificationBell() {
  const { notificacoes, naoLidas, ultimaVista, marcarComoVistas } = useNotificacoes();
  const [aberto, setAberto] = useState(false);

  // Guarda o "visto até" de quando a lista foi aberta, para destacar os
  // avisos novos enquanto ela estiver aberta (marcarComoVistas já zera o contador).
  const [vistaAoAbrir, setVistaAoAbrir] = useState(ultimaVista);

  function alternar() {
    if (!aberto) {
      setVistaAoAbrir(ultimaVista);
      marcarComoVistas();
    }
    setAberto(!aberto);
  }

  const rotulo = naoLidas > 0 ? `Notificações (${naoLidas} novas)` : 'Notificações';

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="app-header__bell notification-bell__botao"
        aria-label={rotulo}
        aria-expanded={aberto}
        onClick={alternar}
      >
        <Bell size={20} aria-hidden="true" />
        {naoLidas > 0 && (
          <span className="notification-bell__contador" aria-hidden="true">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="notification-bell__painel" role="region" aria-label="Avisos">
          <h3 className="notification-bell__titulo">Avisos</h3>

          {notificacoes.length === 0 ? (
            <p className="notification-bell__vazio">Nenhum aviso por enquanto.</p>
          ) : (
            <ul className="notification-bell__lista">
              {notificacoes.map((notificacao) => (
                <li
                  key={notificacao.id}
                  className={`notification-bell__item ${notificacao.createdAt > vistaAoAbrir ? 'is-nova' : ''}`}
                >
                  <span className="notification-bell__tipo">
                    {TIPOS_NOTIFICACAO[notificacao.tipo] || 'Aviso'} · {formatarQuando(notificacao.createdAt)}
                  </span>
                  <strong>{notificacao.titulo}</strong>
                  <p>{notificacao.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
