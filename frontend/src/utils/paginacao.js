/**
 * Quais itens mostrar entre "Anterior" e "Próximo".
 *
 * Sempre aparecem a primeira página, a última e a atual com as vizinhas;
 * os buracos viram "…". Ex.: com 10 páginas →
 *   página 1:  1 2 3 … 10
 *   página 5:  1 … 4 5 6 … 10
 *   página 10: 1 … 8 9 10
 * Um buraco de uma página só mostra o número em vez de "…" (o "…" não
 * economizaria espaço). Até 7 páginas, todas aparecem.
 */
export function paginasVisiveis(atual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  let inicio = Math.max(2, atual - 1);
  let fim = Math.min(total - 1, atual + 1);
  // Nas pontas mantém três números juntos, como em "1 2 3 … 10".
  if (atual <= 2) fim = 3;
  if (atual >= total - 1) inicio = total - 2;

  const itens = [1];
  if (inicio > 2) itens.push(inicio === 3 ? 2 : 'reticencias-inicio');
  for (let pagina = inicio; pagina <= fim; pagina += 1) itens.push(pagina);
  if (fim < total - 1) itens.push(fim === total - 2 ? total - 1 : 'reticencias-fim');
  itens.push(total);

  return itens;
}
