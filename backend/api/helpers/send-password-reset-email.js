/**
 * send-password-reset-email.js
 *
 * @description :: Envia o e-mail de redefinição via SMTP (nodemailer).
 *                  Em desenvolvimento, se as variáveis de SMTP não estiverem
 *                  configuradas, apenas loga o link no console. Em produção
 *                  isso é tratado como erro: o link nunca vai para o log e a
 *                  falha aparece no log de erros da API.
 *
 *                  O nome vem do cadastro (digitado pelo próprio usuário),
 *                  então é escapado antes de entrar no HTML: um nome como
 *                  `<a href="...">Clique aqui</a>` apareceria como texto, e
 *                  não como um link falso dentro de um e-mail legítimo.
 */

/**
 * Troca os caracteres especiais do HTML pelas entidades equivalentes, para
 * o texto ser exibido como texto e nunca interpretado como marcação.
 */
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

    // Texto puro não interpreta HTML: aqui o nome vai como foi digitado.
    const saudacao = `Olá${inputs.nome ? ', ' + inputs.nome : ''}!`;
    const saudacaoHtml = `Olá${inputs.nome ? ', ' + escaparHtml(inputs.nome) : ''}!`;

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
    <p>${saudacaoHtml}</p>
    <p>Recebemos uma solicitação para redefinir sua senha na plataforma Quintal da Amora.</p>
    <p><a href="${escaparHtml(inputs.link)}">Clique aqui para criar uma nova senha</a></p>
    <p>Esse link expira em 30 minutos. Se você não solicitou, pode ignorar este e-mail.</p>
  `
    });

    sails.log.info(`E-mail de redefinição enviado (id ${info.messageId}).`);

  }

};
