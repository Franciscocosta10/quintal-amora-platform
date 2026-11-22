/**
 * RF08 — inscrição em concurso. A inscrição já é a confirmação de
 * presença (nasce com status 'inscrito'); no dia, o admin marca quem
 * compareceu (RF10, registration/presence).
 *
 * Limitação: o Waterline não garante unicidade composta nem contagem
 * atômica de vagas. Para o volume do evento é aceitável; a solução seria
 * uma constraint única no banco, como a do check-in.
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
