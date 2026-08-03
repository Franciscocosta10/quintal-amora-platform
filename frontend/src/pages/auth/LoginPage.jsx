/**
 * pages/auth/LoginPage.jsx
 * RF02 — login.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import FormField from '../../components/auth/FormField';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(email, senha);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amora-500 text-white shadow-sm shadow-amora-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h1 className="text-lg font-semibold text-plum-900 underline decoration-amora-200 underline-offset-4">
          Fazer login
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
          id="email"
          label="Email"
          type="email"
          placeholder="Value"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormField
          id="senha"
          label="Senha"
          type="password"
          placeholder="Value"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-xl bg-amora-500 py-3 text-sm font-semibold text-white transition hover:bg-amora-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm">
        <Link to="/esqueci-senha" className="font-medium text-amora-500 underline underline-offset-2 hover:text-amora-600">
          Esqueceu a senha?
        </Link>
        <p className="text-gray-500">
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-amora-500 hover:text-amora-600">
            Cadastre-se
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
