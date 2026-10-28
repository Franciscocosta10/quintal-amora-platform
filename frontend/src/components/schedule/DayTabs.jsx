import './DayTabs.css';

/**
 * DayTabs — abas "Todos / dias.../ Favoritos".
 *
 * `temFavoritos` e `isAdmin` controlam a aba "★ Favoritos":
 *  - só aparece para quem NÃO é admin;
 *  - só aparece se existir pelo menos 1 favorito.
 * A aba fica logo depois de "Todos" (antes dos dias/categorias).
 */
export default function DayTabs({
  dias,
  diaSelecionado,
  onSelecionar,
  favoritosSelecionado = false,
  onSelecionarFavoritos,
  isAdmin = false,
  temFavoritos = false
}) {
  const mostrarAbaFavoritos = !isAdmin && temFavoritos;

  return (
    <div className="day-tabs">
      <button
        type="button"
        className={`day-tabs__tab ${diaSelecionado === null && !favoritosSelecionado ? 'is-active' : ''}`}
        onClick={() => onSelecionar(null)}
      >
        Todos
      </button>

      {mostrarAbaFavoritos && (
        <button
          type="button"
          className={`day-tabs__tab ${favoritosSelecionado ? 'is-active' : ''}`}
          onClick={() => onSelecionarFavoritos?.()}
        >
          ★ Favoritos
        </button>
      )}

      {dias.map((dia) => (
        <button
          key={dia.chave}
          type="button"
          className={`day-tabs__tab ${diaSelecionado === dia.chave && !favoritosSelecionado ? 'is-active' : ''}`}
          onClick={() => onSelecionar(dia.chave)}
        >
          {dia.rotulo}
        </button>
      ))}
    </div>
  );
}