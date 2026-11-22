/**
 * Política de Privacidade (LGPD — Lei nº 13.709/2018).
 *
 * Página pública, linkada no cadastro. Informa ao titular quais dados são
 * coletados, para quê, com quem são compartilhados, por quanto tempo ficam
 * guardados e como pedir acesso, correção ou exclusão (art. 9º e art. 18).
 *
 * O e-mail de contato fica em CONTATO_PRIVACIDADE, num lugar só.
 */
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const CONTATO_PRIVACIDADE = 'quintaldaamora.suporte@gmail.com';
const ULTIMA_ATUALIZACAO = '22/11/2026';

function Secao({ titulo, children }) {
  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-plum-900">{titulo}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

export default function PoliticaPrivacidade() {
  return (
    <main className="min-h-screen bg-amora-50 px-4 py-10">
      <article className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(238,61,108,0.25)] sm:p-8">
        <header className="flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amora-600 text-white">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold text-plum-900">Política de Privacidade</h1>
          <p className="mt-1 text-xs text-gray-500">Última atualização: {ULTIMA_ATUALIZACAO}</p>
        </header>

        <p className="mt-6 text-sm leading-relaxed text-gray-700">
          Esta política explica como a plataforma do evento <strong>Quintal da Amora</strong> trata os seus
          dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018). A organização
          do evento é a responsável (controladora) pelos dados.
        </p>

        <Secao titulo="1. Quais dados coletamos">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>No cadastro:</strong> nome completo, e-mail e senha. A senha é guardada apenas como hash (bcrypt), nunca em texto.</li>
            <li><strong>Opcional:</strong> foto de perfil.</li>
            <li><strong>Durante o evento:</strong> check-ins realizados (data, horário e totem) e inscrições em concursos.</li>
          </ul>
          <p>Não coletamos CPF, telefone, endereço nem dados de pagamento.</p>
        </Secao>

        <Secao titulo="2. Para que usamos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Identificar você na plataforma e manter a sua conta segura.</li>
            <li>Registrar a sua entrada no evento e as suas inscrições em concursos.</li>
            <li>Mostrar avisos sobre a programação e os concursos.</li>
            <li>Enviar o e-mail de recuperação de senha, quando você pedir.</li>
            <li>Gerar totais do evento para a organização (por exemplo, número de check-ins).</li>
          </ul>
          <p>
            A base legal é a execução do serviço que você solicitou ao criar a conta (art. 7º, V, da LGPD).
            Não usamos os seus dados para publicidade e não os vendemos.
          </p>
        </Secao>

        <Secao titulo="3. Com quem compartilhamos">
          <p>Os dados são acessados apenas pela organização do evento (administradores da plataforma) e pelos serviços necessários para o sistema funcionar:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Microsoft Azure:</strong> hospedagem da plataforma e do banco de dados, na região Brazil South, no Brasil.</li>
            <li><strong>Google (Gmail):</strong> envio do e-mail de recuperação de senha.</li>
            <li><strong>New Relic:</strong> monitoramento técnico da plataforma, configurado para não receber dados pessoais.</li>
          </ul>
        </Secao>

        <Secao titulo="4. Armazenamento no seu navegador">
          <p>
            A plataforma guarda no seu navegador (localStorage) o token de login, para você não precisar entrar
            de novo a cada visita, e as atividades e concursos que você favoritou. Não usamos cookies de
            rastreamento nem de publicidade. Ao sair da conta, o token é apagado.
          </p>
        </Secao>

        <Secao titulo="5. Segurança">
          <p>
            Usamos conexão criptografada (HTTPS), senhas com hash, controle de acesso por perfil e limite de
            tentativas de login. Apenas administradores veem a lista de participantes.
          </p>
        </Secao>

        <Secao titulo="6. Por quanto tempo guardamos">
          <p>
            Os dados ficam guardados enquanto a sua conta existir. Você pode pedir a exclusão a qualquer momento,
            pelo contato abaixo.
          </p>
        </Secao>

        <Secao titulo="7. Seus direitos">
          <p>
            Você pode pedir a confirmação de que tratamos os seus dados, o acesso a eles, a correção de dados
            incorretos e a exclusão da conta e dos dados pessoais (art. 18 da LGPD). Nome e e-mail também podem
            ser alterados por você mesmo, em <strong>Minha conta</strong>.
          </p>
          <p>
            Para exercer esses direitos ou tirar dúvidas, escreva para{' '}
            <a href={`mailto:${CONTATO_PRIVACIDADE}`} className="font-medium text-amora-600 underline underline-offset-2 hover:text-amora-700">
              {CONTATO_PRIVACIDADE}
            </a>.
          </p>
        </Secao>

        <div className="mt-8 flex justify-center">
          <Link to="/cadastro" className="inline-flex min-h-11 items-center rounded-xl bg-amora-600 px-5 text-sm font-semibold text-white transition hover:bg-amora-700">
            Voltar ao cadastro
          </Link>
        </div>
      </article>
    </main>
  );
}
