/**
 * registration/create.js
 *
 * RF08 — inscrição em concurso. "Confirmação de presença" é o próprio
 * ato de se inscrever (decisão confirmada em conversa) — não existe uma
 * etapa separada de confirmação; o registro já nasce com status
 * 'inscrito'. O campo `presencaConfirmada` do model fica sem uso por
 * enquanto (fica pronto caso um dia vire um check-in físico no dia).
 *
 * Protegida por isLoggedIn — qualquer usuário autenticado pode se
 * inscrever (ver config/policies.js).
 *
 * ATENÇÃO (mesma limitação já documentada em InscricaoConcurso.js):
 * Waterline não garante unicidade composta nem atomicidade na contagem
 * de vagas a nível de banco. Para o volume esperado do evento isso é
 * aceitável; se virar requisito real, a solução é uma constraint única
 * composta via SQL bruto, como já foi feito para check-in em
 * schema-quintal-amora.sql.
 */

module.exports = {

  friendlyName: 'Create registration',

  description: 'Inscreve o usuário autenticado em um concurso.',

  inputs: {

    concursoId: {
      type: 'number',
      required: true
    }

  },

  exits: {
    success: {
      description: 'Inscrição realizada com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    },
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs) {

    var usuarioId = this.req.usuario.id;

    var concurso = await Concurso.findOne({ id: inputs.concursoId });
    if (!concurso) {
      throw 'notFound';
    }

    if (concurso.status !== 'aberto') {
      throw { badRequest: { message: 'Inscrições encerradas para este concurso.' } };
    }

    var agora = Date.now();

    if (agora < concurso.inicioInscricao) {
      throw { badRequest: { message: 'As inscrições para este concurso ainda não foram abertas.' } };
    }

    if (agora > concurso.fimInscricao) {
      throw { badRequest: { message: 'O período de inscrição deste concurso já foi encerrado.' } };
    }

    var inscricaoExistente = await InscricaoConcurso.findOne({
      usuario: usuarioId,
      concurso: concurso.id,
      status: { '!=': 'cancelado' }
    });

    if (inscricaoExistente) {
      throw { badRequest: { message: 'Você já está inscrito neste concurso.' } };
    }

    if (concurso.limiteParticipantes) {

      var totalInscritos = await InscricaoConcurso.count({
        concurso: concurso.id,
        status: { '!=': 'cancelado' }
      });

      if (totalInscritos >= concurso.limiteParticipantes) {
        throw { badRequest: { message: 'Vagas Esgotadas' } };
      }

    }

    var novaInscricao = await InscricaoConcurso.create({
      usuario: usuarioId,
      concurso: concurso.id,
      status: 'inscrito'
    }).fetch();

    return novaInscricao;

  }

};