function obterDiaEmSaoPaulo(timestampMs) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(timestampMs));
}

module.exports = {

  friendlyName: 'Create contest',

  description: 'Cadastra um novo concurso (somente admin).',

  inputs: {

    nome: { type: 'string', required: true, maxLength: 120 },
    categoria: { type: 'string', allowNull: true, maxLength: 60 },
    descricao: { type: 'string', allowNull: true },

    dataHoraInicio: { type: 'number', required: true },
    dataHoraFim: { type: 'number', required: true },

    limiteParticipantes: { type: 'number', allowNull: true },

    inicioInscricao: { type: 'number', required: true },
    fimInscricao: { type: 'number', required: true },

    evento: { type: 'number', required: true }

  },

  exits: {
    success: { description: 'Concurso criado com sucesso.' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function (inputs) {

    var hoje = obterDiaEmSaoPaulo(Date.now());
    var diaDoConcurso = obterDiaEmSaoPaulo(inputs.dataHoraInicio);

    if (diaDoConcurso < hoje) {
      throw { badRequest: { message: 'A data do concurso não pode ser no passado.' } };
    }

    if (inputs.dataHoraFim <= inputs.dataHoraInicio) {
      throw { badRequest: { message: 'O horário de término deve ser depois do horário de início.' } };
    }

    if (inputs.inicioInscricao > inputs.fimInscricao) {
      throw { badRequest: { message: 'O início das inscrições não pode ser depois do término.' } };
    }

    if (inputs.fimInscricao > inputs.dataHoraInicio) {
      throw { badRequest: { message: 'As inscrições precisam encerrar antes do início do concurso.' } };
    }

    if (
      inputs.limiteParticipantes !== undefined &&
      inputs.limiteParticipantes !== null &&
      inputs.limiteParticipantes <= 0
    ) {
      throw { badRequest: { message: 'limiteParticipantes deve ser maior que zero.' } };
    }

    var eventoExiste = await Evento.findOne({ id: inputs.evento });
    if (!eventoExiste) {
      throw { badRequest: { message: 'Evento informado não existe.' } };
    }

    var novoConcurso = await Concurso.create(inputs).fetch();

    return novoConcurso;

  }

};