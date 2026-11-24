/**
 * Agrupa os concursos por categoria, no mesmo formato `{ chave, rotulo }`
 * que o DayTabs espera (como o agruparPorDia faz com os dias).
 */

export function agruparPorCategoria(concursos) {
  const porCategoria = {};

  concursos.forEach((concurso) => {
    const chave = concurso.categoria || 'outro';

    if (!porCategoria[chave]) {
      porCategoria[chave] = [];
    }

    porCategoria[chave].push(concurso);
  });

  const categorias = Object.keys(porCategoria)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((chave) => ({
      chave,
      rotulo: chave.charAt(0).toUpperCase() + chave.slice(1)
    }));

  return { categorias, porCategoria };
}