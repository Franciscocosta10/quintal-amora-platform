import './DayTabs.css';

/**
 * DayTabs — as abas "Todos / Sábado - 10/05 / Domingo - 11/05" do mockup.
 * Puramente controlado: quem gerencia qual aba está ativa é a página pai
 * (Home ou Programacao), este componente só desenha e dispara o evento.
 */
export default function DayTabs({ dias, diaSelecionado, onSelecionar }) {
  return (
    <div className="day-tabs">
      <button
        type="button"
        className={`day-tabs__tab ${diaSelecionado === null ? 'is-active' : ''}`}
        onClick={() => onSelecionar(null)}
      >
        Todos
      </button>
      {dias.map((dia) => (
        <button
          key={dia.chave}
          type="button"
          className={`day-tabs__tab ${diaSelecionado === dia.chave ? 'is-active' : ''}`}
          onClick={() => onSelecionar(dia.chave)}
        >
          {dia.rotulo}
        </button>
      ))}
    </div>
  );
}
