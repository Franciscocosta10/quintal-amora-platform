import './ContestItem.css';

const PALETA_CATEGORIAS = ['cor1', 'cor2', 'cor3', 'cor4', 'cor5'];

function corDaCategoria(categoria) {
  if (!categoria) return 'cor5';

  let soma = 0;
  for (let i = 0; i < categoria.length; i++) {
    soma += categoria.charCodeAt(i);
  }

  return PALETA_CATEGORIAS[soma % PALETA_CATEGORIAS.length];
}

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
  const corClasse = corDaCategoria(concurso.categoria);
  const jaInscrito = Boolean(inscricaoId);
  const inscricoesAbertas = concurso.status === 'aberto';

  return (
    <div className="contest-item">
      <span className="contest-item__time">
        {formatarHora(concurso.dataHoraInicio)}
      </span>

      {concurso.categoria && (
        <span className={`contest-item__category contest-item__category--${corClasse}`}>
          {concurso.categoria}
        </span>
      )}

      <div className="contest-item__content">
        <span className="contest-item__title">{concurso.nome}</span>

        {concurso.descricao && (
          <span className="contest-item__description">{concurso.descricao}</span>
        )}

        <span className="contest-item__status">
          {STATUS_LABEL[concurso.status] || concurso.status}
          {concurso.limiteParticipantes && (
            <> · limite de {concurso.limiteParticipantes} participantes</>
          )}
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