/**
 * admin/dashboard.js
 *
 * RF16 — painel administrativo. Versão enxuta da "Central de Gerenciamento"
 * do mockup: devolve, numa única chamada, os números gerais do evento atual
 * e duas listas curtas (próximas atividades e usuários recentes).
 *
 * Protegida por isLoggedIn + isAdmin (RNF07). Os dados de usuários trazem
 * só campos não sensíveis (RNF06).
 *
 * O "evento atual" é o mais recente cadastrado — mesmo critério usado em
 * event/actual-find. Contagens de atividades, concursos, check-ins,
 * inscrições e expositores são filtradas por ele; a contagem de
 * participantes é global, porque a conta do usuário não pertence a um
 * evento específico.
 */

var LIMITE_LISTAS = 5;

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
      .limit(LIMITE_LISTAS);

    // Sem evento cadastrado ainda: o painel continua útil (usuários), mas
    // tudo que depende de evento vem zerado.
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
        proximasAtividades: [],
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

    var proximasAtividades = await Atividade
      .find({
        where: {
          evento: evento.id,
          dataHoraInicio: { '>=': Date.now() },
          status: { '!=': 'cancelada' }
        },
        select: ['titulo', 'tipo', 'local', 'dataHoraInicio', 'status']
      })
      .sort('dataHoraInicio ASC')
      .limit(LIMITE_LISTAS);

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
      proximasAtividades: proximasAtividades,
      usuariosRecentes: usuariosRecentes
    };

  }

};
