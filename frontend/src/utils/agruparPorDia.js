const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function chaveDia(timestampMs) {
  const data = new Date(timestampMs);
  // Chave estável YYYY-MM-DD, independente de fuso na exibição.
  return data.toISOString().slice(0, 10);
}

function rotuloDia(chave) {
  const data = new Date(`${chave}T00:00:00`);
  const diaSemana = DIAS_SEMANA[data.getDay()];
  const diaMes = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${diaSemana} - ${diaMes}/${mes}`;
}

/**
 * Recebe a lista de atividades (já ordenada por dataHoraInicio) e devolve:
 *  - `dias`: [{ chave: '2026-05-10', rotulo: 'Sábado - 10/05' }, ...] em ordem cronológica
 *  - `porDia`: { '2026-05-10': [atividade, atividade, ...] }
 *
 * Usado tanto pelas abas da tela de Programação quanto (opcionalmente)
 * pelo preview da Home.
 */
export function agruparPorDia(atividades) {
  const porDia = {};

  for (const atividade of atividades) {
    const chave = chaveDia(atividade.dataHoraInicio);
    if (!porDia[chave]) porDia[chave] = [];
    porDia[chave].push(atividade);
  }

  const dias = Object.keys(porDia)
    .sort()
    .map((chave) => ({ chave, rotulo: rotuloDia(chave) }));

  return { dias, porDia };
}
