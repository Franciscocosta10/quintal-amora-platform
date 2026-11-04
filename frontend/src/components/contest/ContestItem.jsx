import './ContestItem.css';

const CATEGORIAS = {
  torneio: { label: 'Torneio', classe: 'torneio' },
  desfile: { label: 'Desfile', classe: 'desfile' },
  cosplay: { label: 'Cosplay', classe: 'cosplay' },
  quiz: { label: 'Quiz', classe: 'quiz' },
  outro: { label: 'Outro', classe: 'outro' }
};

function formatarHora(timestampMs) {
  if (!timestampMs) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestampMs));
}

const STATUS_LABEL = {
  aberto: 'Inscrições abertas',
  encerrado: 'Inscrições encerradas',
  cancelado: 'Cancelado'
};

export default function ContestItem({
  concurso,
  isAdmin = false,
  inscricaoId,
  favorito = false,
  onEditar,
  onInscrever,
  onCancelar,
  onAlternarDestaque,
  onAlternarFavorito
}) {
  const categoria = CATEGORIAS[concurso.categoria] || CATEGORIAS.outro;
  const jaInscrito = Boolean(inscricaoId);
  const inscricoesAbertas = concurso.status === 'aberto';

  const quaseLotado =
    concurso.limiteParticipantes &&
    concurso.totalInscritos >= concurso.limiteParticipantes * 0.8 &&
    concurso.totalInscritos < concurso.limiteParticipantes;

  const lotado =
    concurso.limiteParticipantes &&
    concurso.totalInscritos >= concurso.limiteParticipantes;

  return (
    <div className="contest-item">
      <span className="contest-item__time">
        {formatarHora(concurso.dataHoraInicio)}
      </span>

      <span className={`contest-item__category contest-item__category--${categoria.classe}`}>
        {categoria.label}
      </span>

      <div className="contest-item__content">
        <span className="contest-item__title">{concurso.nome}</span>

        {concurso.descricao && (
          <span className="contest-item__description">{concurso.descricao}</span>
        )}

        <span
          className={`contest-item__status ${
            lotado ? 'contest-item__status--lotado' : quaseLotado ? 'contest-item__status--quase-lotado' : ''
        }`}
        >
          {STATUS_LABEL[concurso.status] || concurso.status}
          {' · '}
          {concurso.limiteParticipantes
            ? `${concurso.totalInscritos ?? 0}/${concurso.limiteParticipantes} inscritos`
            : `${concurso.totalInscritos ?? 0} inscrito(s)`}
        </span>
      </div>
      <div className="contest-item__actions">
        {isAdmin ? (
          <>
            <button
              type="button"
              className={`contest-item__highlight ${concurso.destaque ? 'is-active' : ''}`}
              title={concurso.destaque ? 'Remover destaque' : 'Destacar concurso'}
              aria-label={concurso.destaque ? 'Remover destaque' : 'Destacar concurso'}
              onClick={() => onAlternarDestaque?.(concurso)}
            >
              {concurso.destaque ? '★' : '☆'}
            </button>

            <button
              type="button"
              className="contest-item__edit"
              onClick={() => onEditar?.(concurso)}
            >
              Editar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`contest-item__star ${favorito ? 'is-active' : ''}`}
              aria-label={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={() => onAlternarFavorito?.(concurso.id)}
            >
              {favorito ? '★' : '☆'}
            </button>

            {jaInscrito ? (
              <button
                type="button"
                className="contest-item__cancel"
                onClick={() => onCancelar?.(inscricaoId)}
              >
                Inscrito ✓ Cancelar
              </button>
            ) : (
              <button
                type="button"
                className="contest-item__register"
                disabled={!inscricoesAbertas}
                onClick={() => onInscrever?.(concurso.id)}
              >
                {inscricoesAbertas ? 'Inscrever-se' : 'Encerrado'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}