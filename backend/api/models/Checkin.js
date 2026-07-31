/**
 * Checkin.js
 *
 * RF04: check-in por QR Code. RF05: registrar horário de entrada.
 * Regra de negócio: o QR Code fica disponível na entrada e em pontos
 * estratégicos do evento, então guardamos `pontoDeEntrada` para permitir
 * relatórios de fluxo por local, não só por horário.
 */

module.exports = {

  attributes: {

    dataHoraEntrada: {
      type: 'number', // epoch (ms) — RF05
      required: true
    },

    pontoDeEntrada: {
      type: 'string',
      allowNull: true // ex: "Entrada Principal", "Palco 2"
    },

    codigoQrUtilizado: {
      type: 'string',
      allowNull: true // referência/identificador do QR lido, útil para auditoria
    },

    usuario: {
      model: 'usuario',
      required: true
    },

    evento: {
      model: 'evento',
      required: true
    }

  }

};
