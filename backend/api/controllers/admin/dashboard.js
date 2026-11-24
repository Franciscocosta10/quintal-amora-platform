/**
 * RF16 — painel administrativo.
 *
 * Protegida por isLoggedIn + isAdmin (RNF07). Os dados de usuários trazem
 * só campos não sensíveis (RNF06).
 */

var LIMITE_USUARIOS_RECENTES = 5;

module.exports = {

  friendlyName: 'Painel administrativo',

  description: 'Retorna os dados gerais do evento atual para o painel do administrador.',

  inputs: {},

  exits: {
    success: {
      description: 'Dados do painel retornados com sucesso.'
    }
  },

  fn: async function () {

    var eventos = await Evento.find().sort('createdAt DESC').limit(1);
    var evento = eventos[0] || null;

    var participantes = await Usuario.count({ perfil: 'visitante', ativo: true });

    var usuariosRecentes = await Usuario
      .find({ select: ['nomeCompleto', 'email', 'perfil', 'ativo', 'createdAt'] })
      .sort('createdAt DESC')
      .limit(LIMITE_USUARIOS_RECENTES);

    if (!evento) {
      return {
        evento: null,
        totais: {
          participantes: participantes,
          checkins: 0,
          atividades: 0,
          concursosAbertos: 0,
          inscricoes: 0,
          expositores: 0
        },
        usuariosRecentes: usuariosRecentes
      };
    }

    var concursos = await Concurso.find({ where: { evento: evento.id }, select: ['id', 'status'] });
    var idsConcursos = concursos.map((concurso) => { return concurso.id; });
    var concursosAbertos = concursos.filter((concurso) => {
      return concurso.status === 'aberto';
    }).length;

    // `concurso: []` no Waterline não casa nada — evita a consulta à toa.
    var inscricoes = idsConcursos.length === 0 ? 0 : await InscricaoConcurso.count({
      concurso: { in: idsConcursos },
      status: { '!=': 'cancelado' }
    });

    var checkins = await Checkin.count({ evento: evento.id });
    var atividades = await Atividade.count({ evento: evento.id, status: { '!=': 'cancelada' } });
    var expositores = await Expositor.count({ evento: evento.id });

    return {
      evento: {
        id: evento.id,
        nome: evento.nome,
        edicao: evento.edicao,
        localizacao: evento.localizacao,
        dataHoraInicio: evento.dataHoraInicio,
        dataHoraFim: evento.dataHoraFim,
        ativo: evento.ativo
      },
      totais: {
        participantes: participantes,
        checkins: checkins,
        atividades: atividades,
        concursosAbertos: concursosAbertos,
        inscricoes: inscricoes,
        expositores: expositores
      },
      usuariosRecentes: usuariosRecentes
    };

  }

};
