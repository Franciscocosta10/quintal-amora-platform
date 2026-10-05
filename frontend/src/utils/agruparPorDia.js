const DIAS_SEMANA = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

function obterDataLocal(timestampMs) {
  return new Date(
    new Date(timestampMs).toLocaleString('en-US', {
      timeZone: 'America/Sao_Paulo'
    })
  );
}

function chaveDia(timestampMs) {
  const data = obterDataLocal(timestampMs);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function rotuloDia(chave) {
  const [ano, mes, dia] = chave.split('-').map(Number);

  const data = new Date(ano, mes - 1, dia);

  const diaSemana = DIAS_SEMANA[data.getDay()];
  const diaMes = String(dia).padStart(2, '0');
  const mesFormatado = String(mes).padStart(2, '0');

  return `${diaSemana} - ${diaMes}/${mesFormatado}`;
}

/**
 * Recebe a lista de atividades e devolve:
 * - dias: [{ chave, rotulo }]
 * - porDia: { chave: [atividades] }
 */
export function agruparPorDia(atividades) {
  const porDia = {};

  for (const atividade of atividades) {
    const chave = chaveDia(atividade.dataHoraInicio);

    if (!porDia[chave]) {
      porDia[chave] = [];
    }

    porDia[chave].push(atividade);
  }

  const dias = Object.keys(porDia)
    .sort()
    .map((chave) => ({
      chave,
      rotulo: rotuloDia(chave)
    }));

  return { dias, porDia };
}