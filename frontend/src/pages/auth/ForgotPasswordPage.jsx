/**
 * pages/auth/ForgotPasswordPage.jsx
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import FormField from '../../components/auth/FormField';
import StepIndicator from '../../components/auth/StepIndicator';
import { apiFetch } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');

    if (!email) {
      setErro('Informe um e-mail.');
      return;
    }

   setEnviando(true);

try {
  await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
  });

  setEnviado(true);
} catch (err) {
  setErro(err.message);
} finally {
  setEnviando(false);
}
  }

  return (
    <AuthLayout>
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-amora-500 hover:text-amora-600"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar para login
      </Link>

      <h1 className="text-2xl font-bold text-plum-900">Esqueceu sua senha?</h1>
      <p className="mt-2 text-sm text-gray-500">
        Não se preocupe! Informe seu e-mail cadastrado que enviaremos um link para você redefinir sua senha.
      </p>

      <div className="mt-6">
        <StepIndicator etapaAtual={1} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(238,61,108,0.25)]">
        {enviado ? (
          <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700" role="status">
            Se este e-mail estiver cadastrado, você vai receber um link de redefinição em instantes.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {erro && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600" role="alert">
                {erro}
              </p>
            )}

            <FormField
              id="email"
              label="E-mail cadastrado"
              type="email"
              placeholder="Value"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={enviando}
              className="mt-6 w-full rounded-xl bg-amora-500 py-3 text-sm font-semibold text-white transition hover:bg-amora-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar link para redefinição'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-5 text-center text-sm">
        <p className="font-semibold text-plum-900">Ainda está com problemas?</p>
        <p className="text-amora-500">
          Entre em contato com o suporte:{' '}
          <a href="mailto:suportequintaldaamora@gmail.com" className="underline underline-offset-2">
            suportequintaldaamora@gmail.com
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
