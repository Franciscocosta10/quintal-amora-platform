/**
 * agruparPorCategoria — mesma lógica de agruparPorDia.js, mas agrupando
 * concursos por categoria em vez de dia. Retorna o mesmo formato
 * {chave, rotulo} que o DayTabs.jsx (reaproveitado sem alterações)
 * espera na prop `dias`.
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