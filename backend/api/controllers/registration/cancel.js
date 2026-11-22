/**
 * Cancela uma inscrição mudando o `status` (não apaga): a vaga volta a
 * ficar livre e o histórico fica guardado.
 *
 * O dono da inscrição ou um admin podem cancelar; essa checagem é feita
 * aqui dentro, porque a rota só exige isLoggedIn.
 */

module.exports = {

  friendlyName: 'Cancel registration',

  description: 'Cancela uma inscrição em concurso.',

  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Inscrição cancelada com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    },
    forbidden: {
      responseType: 'forbidden'
    }
  },

  fn: async function (inputs) {

    var usuarioLogado = this.req.usuario;

    var inscricao = await InscricaoConcurso.findOne({ id: inputs.id });
    if (!inscricao) {
      throw 'notFound';
    }

    var ehDono = inscricao.usuario === usuarioLogado.id;
    var ehAdmin = usuarioLogado.perfil === 'administrador';

    if (!ehDono && !ehAdmin) {
      throw 'forbidden';
    }

    var inscricaoAtualizada = await InscricaoConcurso
      .updateOne({ id: inputs.id })
      .set({ status: 'cancelado' });

    return inscricaoAtualizada;

  }

};
