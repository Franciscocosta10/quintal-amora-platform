/**
 * RF01 — cadastro de usuário.
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import FormField from '../../components/auth/FormField';
import { useAuth } from '../../hooks/useAuth';

const SENHA_MIN_LENGTH = 8; // mesmo mínimo validado no backend (auth/signup.js)

export default function SignupPage() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  // Repassado pelo login: página para onde voltar depois do cadastro
  // (ex: link do QR do check-in).
  const location = useLocation();
  const voltarPara = location.state?.voltarPara;

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');

    if (senha.length < SENHA_MIN_LENGTH) {
      setErro(`A senha precisa ter pelo menos ${SENHA_MIN_LENGTH} caracteres.`);
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    setEnviando(true);
    try {
      await cadastrar({ nomeCompleto, email, senha });
      navigate(voltarPara ?? '/', { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amora-600 text-white shadow-sm shadow-amora-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7" />
          </svg>
        </span>
        <h1 className="text-lg font-semibold text-plum-900 underline decoration-amora-200 underline-offset-4">
          Criar conta
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(238,61,108,0.25)]"
      >
        {erro && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600" role="alert">
            {erro}
          </p>
        )}

        <FormField
          id="nomeCompleto"
          label="Nome completo"
          type="text"
          placeholder="Digite seu nome completo"
          autoComplete="name"
          required
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Digite seu e-mail"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormField
          id="senha"
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          autoComplete="new-password"
          required
          minLength={SENHA_MIN_LENGTH}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <FormField
          id="confirmarSenha"
          label="Confirmar senha"
          type="password"
          placeholder="Confirme sua senha"
          autoComplete="new-password"
          required
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-xl bg-amora-600 py-3 text-sm font-semibold text-white transition hover:bg-amora-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>

        {/* LGPD: informa, no momento da coleta, como os dados são tratados. */}
        <p className="mt-4 text-center text-xs leading-relaxed text-gray-600">
          Ao criar sua conta, você concorda com o uso dos seus dados conforme a nossa{' '}
          <Link to="/privacidade" className="font-medium text-amora-600 underline underline-offset-2 hover:text-amora-700">
            Política de Privacidade
          </Link>
          .
        </p>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <Link to="/login" state={{ voltarPara }} className="font-medium text-amora-600 hover:text-amora-700">
          Fazer login
        </Link>
      </p>
    </AuthLayout>
  );
}
