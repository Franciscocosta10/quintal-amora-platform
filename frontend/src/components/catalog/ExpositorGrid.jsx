import ExpositorCard from './ExpositorCard';

/** Grid do catálogo (RF13) com os estados de carregando / erro / vazio, como o ContestList. */
export default function ExpositorGrid({
  expositores,
  carregando,
  erro,
  mensagemVazio = 'Nenhum expositor cadastrado ainda.',
  isAdmin,
  onAbrir,
  onEditar
}) {
  if (carregando) {
    return (
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        Carregando expositores…
      </p>
    );
  }

  if (erro) {
    return (
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        Não foi possível carregar o catálogo. Tente novamente.
      </p>
    );
  }

  if (!expositores || expositores.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        {mensagemVazio}
      </p>
    );
  }

  return (
    <div className="expositor-grid">
      {expositores.map((expositor) => (
        <ExpositorCard
          key={expositor.id}
          expositor={expositor}
          isAdmin={isAdmin}
          onAbrir={onAbrir}
          onEditar={onEditar}
        />
      ))}
    </div>
  );
}
