/**
 * registration/find-mine.js
 *
 * Lista as inscrições do próprio usuário autenticado, com o concurso
 * populado — usado pelo frontend pra saber qual botão mostrar
 * ("Inscrever-se" x "Inscrito ✓ Cancelar"). Protegida por isLoggedIn.
 */

module.exports = {

  friendlyName: 'Find my registrations',

  description: 'Lista as inscrições do usuário autenticado.',

  inputs: {},

  exits: {
    success: {
      description: 'Lista de inscrições retornada com sucesso.'
    }
  },

  fn: async function () {

    var usuarioId = this.req.usuario.id;

    var inscricoes = await InscricaoConcurso
      .find({ usuario: usuarioId })
      .populate('concurso')
      .sort('createdAt DESC');

    return inscricoes;

  }

};