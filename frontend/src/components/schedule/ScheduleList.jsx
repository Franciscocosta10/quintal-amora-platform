import ScheduleItem from './ScheduleItem';

export default function ScheduleList({
  atividades,
  carregando,
  erro,
  isAdmin,
  onEditar
}) {
  if (carregando) {
    return (
      <p
        className="text-sm"
        style={{ color: 'var(--text)' }}
      >
        Carregando programação…
      </p>
    );
  }

  if (erro) {
    return (
      <p
        className="text-sm"
        style={{ color: 'var(--text)' }}
      >
        Não foi possível carregar a programação.
        Tente novamente.
      </p>
    );
  }

  if (!atividades || atividades.length === 0) {
    return (
      <p
        className="text-sm"
        style={{ color: 'var(--text)' }}
      >
        Nenhuma atividade cadastrada para este
        filtro ainda.
      </p>
    );
  }

  return (
    <div>
      {atividades.map((atividade) => (
        <ScheduleItem
          key={atividade.id}
          atividade={atividade}
          isAdmin={isAdmin}
          onEditar={onEditar}
        />
      ))}
    </div>
  );
}