/**
 * Datas do evento (model Evento: dataHoraInicio e dataHoraFim em epoch ms).
 *
 * Tudo no fuso de Joinville, o mesmo usado no ContestForm: assim quem abre
 * o site de outro fuso vê o horário real do evento.
 */

const FUSO = 'America/Sao_Paulo';

const formatoDia = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit'
});

const formatoDiaCompleto = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const formatoHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  hour: '2-digit',
  minute: '2-digit'
});

// "aaaa-mm-dd" no fuso do evento (en-CA já usa esse formato).
const formatoChaveDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

/** "21 de novembro de 2026" (um dia) ou "21/11 a 22/11" (vários dias). */
export function formatarPeriodo(inicio, fim) {
  if (formatoChaveDia.format(inicio) === formatoChaveDia.format(fim)) {
    return formatoDiaCompleto.format(inicio);
  }
  return `${formatoDia.format(inicio)} a ${formatoDia.format(fim)}`;
}

/** "10:00 às 20:00" — abertura do primeiro dia e fechamento do último. */
export function formatarHorario(inicio, fim) {
  return `${formatoHora.format(inicio)} às ${formatoHora.format(fim)}`;
}

/** epoch ms → valor de <input type="datetime-local"> ("aaaa-mm-ddThh:mm"). */
export function paraInputDataHora(timestamp) {
  if (!timestamp) return '';
  return `${formatoChaveDia.format(timestamp)}T${formatoHora.format(timestamp)}`;
}

/** Valor de <input type="datetime-local"> → epoch ms (horário de Brasília). */
export function deInputDataHora(valor) {
  return new Date(`${valor}:00-03:00`).getTime();
}
