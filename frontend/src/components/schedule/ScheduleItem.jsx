import './ScheduleItem.css';
import { editarAtividade } from '../../services/Schedule';

const TIPOS = {
  atracao: {
    label: 'Atração',
    classe: 'atracao'
  },
  apresentacao: {
    label: 'Apresentação',
    classe: 'apresentacao'
  },
  encontro: {
    label: 'Encontro',
    classe: 'encontro'
  },
  oficina: {
    label: 'Oficina',
    classe: 'oficina'
  },
  outro: {
    label: 'Outro',
    classe: 'outro'
  }
};

function formatarHorario(timestampMs) {
  return new Date(timestampMs).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
}

export default function ScheduleItem({
  atividade,
  favorito = false,
  onToggleFavorito,
  isAdmin = false,
  onEditar
}) {
  const tipo = TIPOS[atividade.tipo] || TIPOS.outro;

  async function alternarDestaque() {
    try {
      await editarAtividade(atividade.id, {
        destaque: !atividade.destaque
      });

      window.location.reload();
    } catch (error) {
      console.error(
        'Erro ao alterar destaque:',
        error
      );
    }
  }

  return (
    <div className="schedule-item">
      <span className="schedule-item__time">
        {formatarHorario(atividade.dataHoraInicio)}
      </span>

      <span
        className={`schedule-item__type schedule-item__type--${tipo.classe}`}
      >
        {tipo.label}
      </span>

      <div className="schedule-item__content">
        <span className="schedule-item__title">
          {atividade.titulo}
        </span>

        {atividade.descricao && (
          <span className="schedule-item__description">
            {atividade.descricao}
          </span>
        )}

        {atividade.local && (
          <span className="schedule-item__location">
            📍 {atividade.local}
          </span>
        )}
      </div>

      <div className="schedule-item__actions">
        {isAdmin ? (
          <>
            <button
              type="button"
              className={`schedule-item__highlight ${
                atividade.destaque
                  ? 'is-active'
                  : ''
              }`}
              title={
                atividade.destaque
                  ? 'Remover destaque'
                  : 'Destacar atividade'
              }
              aria-label={
                atividade.destaque
                  ? 'Remover destaque'
                  : 'Destacar atividade'
              }
              onClick={alternarDestaque}
            >
              {atividade.destaque ? '★' : '☆'}
            </button>

            <button
              type="button"
              className="schedule-item__edit"
              onClick={() =>
                onEditar?.(atividade)
              }
            >
              Editar
            </button>
          </>
        ) : (
          <button
            type="button"
            className={`schedule-item__star ${
              favorito ? 'is-active' : ''
            }`}
            aria-label={
              favorito
                ? 'Remover dos favoritos'
                : 'Adicionar aos favoritos'
            }
            onClick={() =>
              onToggleFavorito?.(atividade.id)
            }
          >
            {favorito ? '★' : '☆'}
          </button>
        )}
      </div>
    </div>
  );
}