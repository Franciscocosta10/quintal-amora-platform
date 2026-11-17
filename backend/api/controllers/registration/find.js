/**
 * registration/find.js
 *
 * RF10 — lista os participantes inscritos em um concurso.
 * Protegida por isAdmin. De cada inscrito vem só nome e e-mail, em linha
 * com RNF06 (proteger dados do usuário).
 *
 * Os usuários são buscados numa segunda consulta (e não com
 * `.populate('usuario', { select })`): o Waterline não aceita `select`
 * no populate de uma associação singular (`model`) e responde 500.
 */

module.exports = {

  friendlyName: 'Find registrations',

  description: 'Lista as inscrições de um concurso (somente admin).',

  inputs: {

    concursoId: {
      type: 'number',
      required: true
    },

    status: {
      type: 'string',
      isIn: ['inscrito', 'confirmado', 'cancelado']
    }

  },

  exits: {
    success: {
      description: 'Lista de inscrições retornada com sucesso.'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function (inputs) {

    var concursoExiste = await Concurso.findOne({ id: inputs.concursoId });
    if (!concursoExiste) {
      throw 'notFound';
    }

    var query = { concurso: inputs.concursoId };

    if (inputs.status) {
      query.status = inputs.status;
    }

    var inscricoes = await InscricaoConcurso
      .find(query)
      .sort('createdAt ASC');

    if (inscricoes.length === 0) {
      return [];
    }

    var idsUsuarios = _.uniq(inscricoes.map((inscricao) => { return inscricao.usuario; }));
    var usuarios = await Usuario.find({
      where: { id: { in: idsUsuarios } },
      select: ['nomeCompleto', 'email']
    });
    var usuarioPorId = _.indexBy(usuarios, 'id');

    return inscricoes.map((inscricao) => {
      return Object.assign({}, inscricao, { usuario: usuarioPorId[inscricao.usuario] || null });
    });

  }

};