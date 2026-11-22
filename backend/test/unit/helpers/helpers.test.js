const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const signToken = require('../../../api/helpers/jwt/sign-token');
const sendPasswordResetEmail = require('../../../api/helpers/send-password-reset-email');

describe('helpers/jwt/sign-token', function () {
  beforeEach(function () {
    global.sails = { config: { custom: { jwtSecret: 'segredo-de-teste', jwtExpiresIn: '2h' } } };
  });

  afterEach(function () {
    delete global.sails;
  });

  it('assina o id e o perfil com o segredo e a validade configurados', async function () {
    const success = sinon.stub();

    await signToken.fn({ usuarioId: 7, perfil: 'administrador' }, { success });

    const payload = jwt.verify(success.firstCall.args[0], 'segredo-de-teste');
    expect(payload).to.include({ id: 7, perfil: 'administrador' });
    expect(payload.exp - payload.iat).to.equal(2 * 60 * 60);
  });
});

describe('helpers/send-password-reset-email', function () {
  const VARIAVEIS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'NODE_ENV'];
  const ENTRADA = { destinatario: 'ana@email.com', nome: 'Ana Souza', link: 'https://quintal.exemplo/redefinir-senha?token=abc' };
  let ambienteOriginal;
  let sendMail;

  beforeEach(function () {
    ambienteOriginal = {};
    VARIAVEIS.forEach((nome) => {
      ambienteOriginal[nome] = process.env[nome];
      delete process.env[nome];
    });
    global.sails = { log: { warn: sinon.stub(), info: sinon.stub() } };
    sendMail = sinon.stub().resolves({ messageId: '1' });
    sinon.stub(nodemailer, 'createTransport').returns({ sendMail });
  });

  afterEach(function () {
    sinon.restore();
    VARIAVEIS.forEach((nome) => {
      if (ambienteOriginal[nome] === undefined) {
        delete process.env[nome];
      } else {
        process.env[nome] = ambienteOriginal[nome];
      }
    });
    delete global.sails;
  });

  function configurarSmtp(porta) {
    process.env.SMTP_HOST = 'smtp.exemplo';
    process.env.SMTP_USER = 'usuario';
    process.env.SMTP_PASS = 'senha';
    if (porta) {
      process.env.SMTP_PORT = String(porta);
    }
  }

  it('sem SMTP configurado, só mostra o link no log (ambiente de dev)', async function () {
    await sendPasswordResetEmail.fn(ENTRADA);

    expect(nodemailer.createTransport.called).to.be.false;
    expect(global.sails.log.warn.secondCall.args[0]).to.equal(`[dev] Link para ana@email.com: ${ENTRADA.link}`);
  });

  it('em produção sem SMTP configurado, falha sem logar o link', async function () {
    process.env.NODE_ENV = 'production';

    let erro;
    try {
      await sendPasswordResetEmail.fn(ENTRADA);
    } catch (e) {
      erro = e;
    }

    expect(erro).to.be.an('error');
    expect(erro.message).to.include('SMTP não configurado');
    expect(global.sails.log.warn.called).to.be.false;
    expect(nodemailer.createTransport.called).to.be.false;
  });

  it('com SMTP configurado, envia o e-mail com o link e o nome', async function () {
    configurarSmtp();

    await sendPasswordResetEmail.fn(ENTRADA);

    expect(nodemailer.createTransport.firstCall.args[0]).to.deep.equal({
      host: 'smtp.exemplo',
      port: 587,
      secure: false,
      auth: { user: 'usuario', pass: 'senha' }
    });
    const email = sendMail.firstCall.args[0];
    expect(email.to).to.equal('ana@email.com');
    expect(email.from).to.equal('"Quintal da Amora" <no-reply@quintaldaamora.com>');
    expect(email.subject).to.equal('Redefinição de senha — Quintal da Amora');
    expect(email.html).to.include('Olá, Ana Souza!');
    expect(email.html).to.include(`href="${ENTRADA.link}"`);
    expect(email.text).to.include('Olá, Ana Souza!');
    expect(email.text).to.include(ENTRADA.link);
    expect(global.sails.log.info.calledOnce).to.be.true;
  });

  it('escapa o HTML do nome, para ele não virar marcação no e-mail (HTML injection)', async function () {
    configurarSmtp();
    const nomeMalicioso = '<a href="https://golpe.exemplo">Clique aqui</a> & <b>Ana</b>';

    await sendPasswordResetEmail.fn({ ...ENTRADA, nome: nomeMalicioso });

    const { html, text } = sendMail.firstCall.args[0];
    expect(html).to.include(
      'Olá, &lt;a href=&quot;https://golpe.exemplo&quot;&gt;Clique aqui&lt;/a&gt; &amp; &lt;b&gt;Ana&lt;/b&gt;!'
    );
    expect(html).to.not.include('golpe.exemplo">');
    expect(html).to.not.include('<b>Ana</b>');
    // O único link do e-mail continua sendo o de redefinição.
    expect(html.match(/<a /g)).to.have.length(1);
    // No texto puro não há marcação para interpretar: o nome vai como foi digitado.
    expect(text).to.include(`Olá, ${nomeMalicioso}!`);
  });

  it('escapa aspas e apóstrofos do nome', async function () {
    configurarSmtp();

    await sendPasswordResetEmail.fn({ ...ENTRADA, nome: `Ana "Amora" D'Ávila` });

    expect(sendMail.firstCall.args[0].html).to.include('Olá, Ana &quot;Amora&quot; D&#39;Ávila!');
  });

  it('escapa o link dentro do atributo href', async function () {
    configurarSmtp();
    const link = 'https://quintal.exemplo/redefinir-senha?token=abc&x="><script>';

    await sendPasswordResetEmail.fn({ ...ENTRADA, link });

    const { html } = sendMail.firstCall.args[0];
    expect(html).to.include('href="https://quintal.exemplo/redefinir-senha?token=abc&amp;x=&quot;&gt;&lt;script&gt;"');
    expect(html).to.not.include('<script>');
  });

  it('usa conexão segura na porta 465 e o remetente configurado', async function () {
    configurarSmtp(465);
    process.env.SMTP_FROM = 'Quintal <contato@quintal.exemplo>';

    await sendPasswordResetEmail.fn({ ...ENTRADA, nome: '' });

    expect(nodemailer.createTransport.firstCall.args[0]).to.include({ port: 465, secure: true });
    expect(sendMail.firstCall.args[0].from).to.equal('Quintal <contato@quintal.exemplo>');
    expect(sendMail.firstCall.args[0].html).to.include('<p>Olá!</p>');
  });
});
