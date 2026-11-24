/**
 * RF04 / RF05 — check-in por QR Code, com o horário de entrada.
 */

module.exports = {

  attributes: {

    dataHoraEntrada: {
      type: 'number', // epoch (ms) — RF05
      columnType: 'double precision', // "real" (padrão) perde ~1 min de precisão em epoch ms
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
