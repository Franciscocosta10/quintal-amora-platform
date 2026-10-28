module.exports = {

  friendlyName: 'Update contest',

  description: 'Edita um concurso (somente admin).',

  inputs: {

    id: { type: 'number', required: true },

    nome: { type: 'string', maxLength: 120 },
    categoria: { type: 'string', allowNull: true, maxLength: 60 },
    descricao: { type: 'string', allowNull: true },

    dataHoraInicio: { type: 'number' },
    dataHoraFim: { type: 'number' },

    limiteParticipantes: { type: 'number', allowNull: true },

    inicioInscricao: { type: 'number' },
    fimInscricao: { type: 'number' },

    destaque: { type: 'boolean' },

    status: { type: 'string', isIn: ['aberto', 'encerrado', 'cancelado'] }

  },

  exits: {
    success: { description: 'Concurso atualizado com sucesso.' },
    notFound: { responseType: 'notFound' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function (inputs) {

    var id = inputs.id;
    var camposParaAtualizar = _.omit(inputs, ['id']);

    var concursoExistente = await Concurso.findOne({ id: id });
    if (!concursoExistente) {
      throw 'notFound';
    }

    var dataHoraInicioFinal =
      camposParaAtualizar.dataHoraInicio !== undefined
        ? camposParaAtualizar.dataHoraInicio
        : concursoExistente.dataHoraInicio;

    var dataHoraFimFinal =
      camposParaAtualizar.dataHoraFim !== undefined
        ? camposParaAtualizar.dataHoraFim
        : concursoExistente.dataHoraFim;

    var inicioInscricaoFinal =
      camposParaAtualizar.inicioInscricao !== undefined
        ? camposParaAtualizar.inicioInscricao
        : concursoExistente.inicioInscricao;

    var fimInscricaoFinal =
      camposParaAtualizar.fimInscricao !== undefined
        ? camposParaAtualizar.fimInscricao
        : concursoExistente.fimInscricao;

    if (dataHoraFimFinal <= dataHoraInicioFinal) {
      throw { badRequest: { message: 'O horário de término deve ser depois do horário de início.' } };
    }

    if (inicioInscricaoFinal > fimInscricaoFinal) {
      throw { badRequest: { message: 'O início das inscrições não pode ser depois do término.' } };
    }

    if (fimInscricaoFinal > dataHoraInicioFinal) {
      throw { badRequest: { message: 'As inscrições precisam encerrar antes do início do concurso.' } };
    }

    var concursoAtualizado =
      await Concurso.updateOne({ id: id }).set(camposParaAtualizar);

    return concursoAtualizado;

  }

};