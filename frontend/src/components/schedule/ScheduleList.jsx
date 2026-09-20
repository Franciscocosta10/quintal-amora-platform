import ScheduleItem from './ScheduleItem';

/**
 * ScheduleList — puramente de apresentação: recebe a lista já carregada
 * (ver Home.jsx e Programacao.jsx, que fazem o fetch) e cuida só dos
 * estados de carregando/vazio/erro. Mantendo o fetch fora daqui permite
 * reusar este componente tanto no preview da Home (3 itens) quanto na
 * tela completa de Programação (com filtros de dia).
 */
export default function ScheduleList({ atividades, carregando, erro }) {
  if (carregando) {
    return <p className="text-sm" style={{ color: 'var(--text)' }}>Carregando programação…</p>;
  }

  if (erro) {
    return <p className="text-sm" style={{ color: 'var(--text)' }}>Não foi possível carregar a programação. Tente novamente.</p>;
  }

  if (!atividades || atividades.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--text)' }}>Nenhuma atividade cadastrada para este filtro ainda.</p>;
  }

  return (
    <div>
      {atividades.map((atividade) => (
        <ScheduleItem key={atividade.id} atividade={atividade} />
      ))}
    </div>
  );
}
