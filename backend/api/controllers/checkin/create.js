/**
 * RF04 — Permite check-in por QR Code.
 * RF05 — O horário de entrada é registrado automaticamente via `createdAt`
 */

module.exports = {

  friendlyName: 'Registrar check-in',

  description: 'Registra o check-in do usuário autenticado a partir da leitura de um QR Code do evento.',

  inputs: {
  qrCode: {
    type: 'string',
    required: true,
    description: 'Ex: "checkin:evento:3" ou "checkin:evento:3:ponto:Entrada Principal"',
  },
},

 exits: {
    success: {
      statusCode: 200,
    },

    qrInvalido: {
      statusCode: 400,
    },

    eventoNaoEncontrado: {
      statusCode: 404,
    },

    jaFezCheckin: {
      statusCode: 409,
    },
  },

fn: async function (inputs, exits) {
  const usuarioId = this.req.usuario.id;

  const match = inputs.qrCode.match(/^checkin:evento:(\d+)(?::ponto:([\w\- ]+))?$/);
  if (!match) {
    return exits.qrInvalido({ message: 'QR Code inválido para check-in.' });
  }
  const eventoId = Number(match[1]);
  const pontoDeEntrada = match[2] || null;

  const evento = await Evento.findOne({ id: eventoId });
  if (!evento) {
    return exits.eventoNaoEncontrado({ message: 'Evento não encontrado.' });
  }

  const checkinExistente = await Checkin.findOne({ usuario: usuarioId, evento: eventoId });
  if (checkinExistente) {
    return exits.jaFezCheckin({ checkin: checkinExistente, message: 'Você já realizou o check-in neste evento.' });
  }

  const checkin = await Checkin.create({
    usuario: usuarioId,
    evento: eventoId,
    dataHoraEntrada: Date.now(),
    pontoDeEntrada,
    codigoQrUtilizado: inputs.qrCode,
  }).fetch();

  return exits.success({ checkin });
},

};
