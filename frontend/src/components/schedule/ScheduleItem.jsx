import './ScheduleItem.css';

/**
 * Mapa tipo -> ícone. Usamos emoji em vez de instalar uma lib de ícones
 * (ex: lucide-react) porque o projeto ainda não tem nenhuma dependência de
 * ícones — se vocês já usam alguma em outra tela (Login, CheckIn), me
 * avisem que eu troco isso por ela para manter consistência visual.
 */
const ICONES_POR_TIPO = {
  abertura: '▶️',
  musica: '🎵',
  cosplay: '🎭',
  encontro: '🧑‍🤝‍🧑',
  premiacao: '🏆',
  encerramento: '🏁',
  geral: '📌'
};

function formatarHorario(timestampMs) {
  return new Date(timestampMs).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Uma linha da programação (horário + ícone + título + estrela de destaque).
 * Recebe `onToggleFavorito` opcional — a estrela hoje é só visual porque
 * "favoritos" (ver sidebar do mockup) não faz parte de RF06/RF07; deixamos
 * o gancho pronto para quando essa funcionalidade for implementada.
 */
export default function ScheduleItem({ atividade, favorito = false, onToggleFavorito }) {
  const icone = ICONES_POR_TIPO[atividade.tipo] || ICONES_POR_TIPO.geral;

  return (
    <div className="schedule-item">
      <span className="schedule-item__time">{formatarHorario(atividade.dataHoraInicio)}</span>
      <span className="schedule-item__icon" aria-hidden="true">{icone}</span>
      <span className="schedule-item__title">{atividade.titulo}</span>
      <button
        type="button"
        className={`schedule-item__star ${favorito ? 'is-active' : ''}`}
        aria-label={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        onClick={() => onToggleFavorito?.(atividade.id)}
      >
        {favorito ? '★' : '☆'}
      </button>
    </div>
  );
}
