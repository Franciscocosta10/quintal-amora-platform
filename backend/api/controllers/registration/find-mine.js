/**
 * Inscrições do usuário logado, com o concurso, para o frontend saber
 * qual botão mostrar ("Inscrever-se" ou "Cancelar").
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
