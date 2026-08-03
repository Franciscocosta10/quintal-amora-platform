/**
 * pages/auth/SignupPage.jsx
 * RF01 — cadastro de usuário.
 *
 * Sem mockup próprio no protótipo (só vi login e esqueci-senha), então
 * segui a mesma linguagem visual das outras duas: ícone + título
 * sublinhado, cartão branco, botão rosa cheio.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import FormField from '../../components/auth/FormField';
import { useAuth } from '../../hooks/useAuth';

const SENHA_MIN_LENGTH = 8; // mesmo mínimo validado no backend (auth/signup.js)

export default function SignupPage() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

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
          placeholder="Value"
          autoComplete="name"
          required
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
        />

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
          placeholder="Value"
          autoComplete="new-password"
          required
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-xl bg-amora-500 py-3 text-sm font-semibold text-white transition hover:bg-amora-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-amora-500 hover:text-amora-600">
          Fazer login
        </Link>
      </p>
    </AuthLayout>
  );
}
