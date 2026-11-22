/**
 * send-password-reset-email.js
 *
 * @description :: Envia o e-mail de redefinição via SMTP (nodemailer).
 *                  Em desenvolvimento, se as variáveis de SMTP não estiverem
 *                  configuradas, apenas loga o link no console. Em produção
 *                  isso é tratado como erro: o link nunca vai para o log e a
 *                  falha aparece no log de erros da API.
 */

module.exports = {

  friendlyName: 'Enviar e-mail de redefinição de senha',

  inputs: {
    destinatario: { type: 'string', required: true },
    nome: { type: 'string', required: false, defaultsTo: '' },
    link: { type: 'string', required: true }
  },

  fn: async function (inputs) {

    const smtpConfigurado = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    if (!smtpConfigurado) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SMTP não configurado: defina SMTP_HOST, SMTP_USER e SMTP_PASS nas configurações do servidor.');
      }
      sails.log.warn('[dev] SMTP não configurado — mostrando link no console em vez de enviar e-mail:');
      sails.log.warn(`[dev] Link para ${inputs.destinatario}: ${inputs.link}`);
      return;
    }

    const nodemailer = require('nodemailer');

    const transportador = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const saudacao = `Olá${inputs.nome ? ', ' + inputs.nome : ''}!`;

    const info = await transportador.sendMail({
      from: process.env.SMTP_FROM || '"Quintal da Amora" <no-reply@quintaldaamora.com>',
      to: inputs.destinatario,
      subject: 'Redefinição de senha — Quintal da Amora',
      text: [
        saudacao,
        '',
        'Recebemos uma solicitação para redefinir sua senha na plataforma Quintal da Amora.',
        `Para criar uma nova senha, acesse: ${inputs.link}`,
        '',
        'Esse link expira em 30 minutos. Se você não solicitou, pode ignorar este e-mail.'
      ].join('\n'),
      html: `
    <p>${saudacao}</p>
    <p>Recebemos uma solicitação para redefinir sua senha na plataforma Quintal da Amora.</p>
    <p><a href="${inputs.link}">Clique aqui para criar uma nova senha</a></p>
    <p>Esse link expira em 30 minutos. Se você não solicitou, pode ignorar este e-mail.</p>
  `
    });

    sails.log.info(`E-mail de redefinição enviado (id ${info.messageId}).`);

  }

};
