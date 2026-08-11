/**
 * send-password-reset-email.js
 *
 * @description :: Envia o e-mail de redefinição via SMTP (nodemailer).
 *                  Se as variáveis de SMTP não estiverem configuradas, apenas
 *                  loga o link no console — útil pra testar o fluxo no dev
 *                  sem precisar configurar e-mail real ainda.
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

    const info = await transportador.sendMail({
  from: process.env.SMTP_FROM || '"Quintal da Amora" <no-reply@quintaldaamora.com>',
  to: inputs.destinatario,
  subject: 'Redefinição de senha — Quintal da Amora',
  html: `
    <p>Olá${inputs.nome ? ', ' + inputs.nome : ''}!</p>
    <p>Recebemos uma solicitação para redefinir sua senha na plataforma Quintal da Amora.</p>
    <p><a href="${inputs.link}">Clique aqui para criar uma nova senha</a></p>
    <p>Esse link expira em 30 minutos. Se você não solicitou, pode ignorar este e-mail.</p>
  `
});

console.log('E-mail enviado!');
console.log('Preview:', nodemailer.getTestMessageUrl(info));

  }

};