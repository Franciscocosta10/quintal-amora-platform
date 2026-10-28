/**
 * registration/cancel.js
 *
 * Cancela uma inscrição via mudança de `status` (não destroyOne) — assim
 * a vaga volta a ficar disponível (registration/create conta apenas
 * status != 'cancelado') e o histórico fica preservado.
 *
 * O próprio usuário pode cancelar a própria inscrição; um administrador
 * pode cancelar a de qualquer um. Protegida só por isLoggedIn — a
 * checagem de dono/admin é feita aqui dentro.
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