import { Bell } from 'lucide-react';
import { useNotificacoes } from '../../hooks/useNotificacoes';
import { TIPOS_NOTIFICACAO } from '../tiposNotificacao';
import './AvisosCard.css';

/**
 * Card "Avisos Importantes" da Home (RF11 / RF12): mostra os últimos
 * avisos enviados pela organização. Usa o mesmo hook do sino do Header,
 * então também se atualiza sozinho a cada 20 segundos.
 *
 * Só exibe — quem marca os avisos como vistos é o sino.
 */

const QUANTIDADE = 3;

function formatarQuando(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

export default function AvisosCard() {
  const { notificacoes } = useNotificacoes();
  const ultimos = notificacoes.slice(0, QUANTIDADE);

  return (
    <div className="home-card">
      <h3 className="com-icone"><Bell size="1em" aria-hidden="true" /> Avisos Importantes</h3>

      {ultimos.length === 0 ? (
        <p className="home-card__placeholder">Nenhum aviso por enquanto.</p>
      ) : (
        <ul className="home-avisos">
          {ultimos.map((aviso) => (
            <li key={aviso.id}>
              <span className="home-avisos__tipo">
                {TIPOS_NOTIFICACAO[aviso.tipo] || 'Aviso'} · {formatarQuando(aviso.createdAt)}
              </span>
              <strong>{aviso.titulo}</strong>
              <p>{aviso.mensagem}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
