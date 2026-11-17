/**
 * utils/avisoAutomatico.js
 *
 * RF09 — avisar os participantes quando o horário de uma atividade ou de
 * um concurso muda. Usado por activity/update e contest/update.
 *
 * Reaproveita as notificações internas (RF11): o aviso automático é só
 * uma Notificacao criada pelo próprio sistema, com o admin que fez a
 * alteração como autor. O participante vê no sino e no card da Home,
 * igual a um aviso enviado à mão.
 *
 * O aviso vai para todos (não só para os inscritos): as notificações do
 * projeto são gerais, e uma mudança de horário interessa a quem pretende
 * assistir, não apenas a quem se inscreveu.
 */

// O evento acontece em Joinville; sem isso o servidor (ex.: Railway, em
// UTC) escreveria o horário 3 horas adiantado na mensagem.
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
  return ['dataHoraInicio', 'dataHoraFim'].some(function (campo) {
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
