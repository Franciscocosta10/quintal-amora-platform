import ContestItem from './ContestItem';

export default function ContestList({
  concursos,
  carregando,
  erro,
  isAdmin,
  minhasInscricoesPorConcurso,
  ehFavorito,
  onEditar,
  onInscrever,
  onCancelar,
  onAlternarDestaque,
  onAlternarFavorito
}) {
  if (carregando) {
    return (
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        Carregando concursos…
      </p>
    );
  }

  if (erro) {
    return (
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        Não foi possível carregar os concursos. Tente novamente.
      </p>
    );
  }

  if (!concursos || concursos.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        Nenhum concurso cadastrado para este filtro ainda.
      </p>
    );
  }

  return (
    <div>
      {concursos.map((concurso) => (
        <ContestItem
          key={concurso.id}
          concurso={concurso}
          isAdmin={isAdmin}
          inscricaoId={minhasInscricoesPorConcurso[concurso.id]}
          favorito={ehFavorito?.(concurso.id)}
          onEditar={onEditar}
          onInscrever={onInscrever}
          onCancelar={onCancelar}
          onAlternarDestaque={onAlternarDestaque}
          onAlternarFavorito={onAlternarFavorito}
        />
      ))}
    </div>
  );
}