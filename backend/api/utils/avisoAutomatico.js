/**
 * RF09 — avisa os participantes quando o horário de uma atividade ou de
 * um concurso muda (usado por activity/update e contest/update).
 *
 * O aviso é uma Notificacao comum, criada em nome do admin que fez a
 * alteração, e vai para todos, não só para os inscritos.
 */

// O evento é em Joinville; sem o fuso fixo, o servidor (em UTC)
// escreveria o horário 3 horas adiantado na mensagem.
var FUSO_DO_EVENTO = 'America/Sao_Paulo';

function formatarDataHora(timestamp) {
  var data = new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_DO_EVENTO,
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(timestamp));

  var hora = new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_DO_EVENTO,
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));

  return data + ' às ' + hora;
}

/**
 * Diz se a edição mudou o horário de início ou de término. Compara os
 * valores (e não só se o campo veio), porque o formulário de edição
 * reenvia todos os campos, mesmo os que não foram alterados.
 */
function mudouHorario(registroAntigo, camposNovos) {
  return ['dataHoraInicio', 'dataHoraFim'].some((campo) => {
    return camposNovos[campo] !== undefined && camposNovos[campo] !== registroAntigo[campo];
  });
}

/**
 * Cria a notificação de mudança de horário.
 *
 * @param {Object} opcoes
 * @param {String} opcoes.tipo   'alteracao_programacao' ou 'chamada_concurso'
 * @param {String} opcoes.nome   título da atividade ou nome do concurso
 * @param {Number} opcoes.inicio novo horário de início (epoch ms)
 * @param {Number} opcoes.autor  id do admin que fez a alteração
 * @param {Object} opcoes.vinculo { atividade: id } ou { concurso: id }, mais o evento
 */
async function avisarMudancaDeHorario(opcoes) {
  return Notificacao.create(Object.assign({
    titulo: 'Mudança de horário: ' + opcoes.nome,
    mensagem: opcoes.nome + ' agora começa em ' + formatarDataHora(opcoes.inicio) + '.',
    tipo: opcoes.tipo,
    autor: opcoes.autor
  }, opcoes.vinculo));
}

module.exports = {
  formatarDataHora: formatarDataHora,
  mudouHorario: mudouHorario,
  avisarMudancaDeHorario: avisarMudancaDeHorario
};
