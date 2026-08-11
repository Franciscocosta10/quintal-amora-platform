import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

function pegarTokenDaUrl() {
  return new URLSearchParams(window.location.search).get('token');
}

export default function RedefinirSenha() {
  const [status, setStatus] = useState('formulario');
  const [erro, setErro] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const token = pegarTokenDaUrl();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!token) {
      setErro('Link de redefinição inválido. Solicite um novo link.');
      return;
    }

    if (novaSenha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setStatus('enviando');

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: {
          token,
          novaSenha,
        },
        auth: false,
      });

      setStatus('sucesso');
    } catch (err) {
      setStatus('formulario');
      setErro(
        err.message ||
          'Esse link expirou ou já foi usado. Solicite uma nova redefinição.'
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-[var(--text-h)] mb-4">
          Redefinir senha
        </h1>

        {status === 'formulario' || status === 'enviando' ? (
          <form onSubmit={handleSubmit}>
            <p className="text-[var(--text)] text-[15px] mb-6">
              Escolha uma nova senha para acessar sua conta.
            </p>

            {!token && (
              <p className="text-[13px] text-red-600 mb-4">
                Link de redefinição inválido. Solicite um novo link.
              </p>
            )}

            <label
              htmlFor="novaSenha"
              className="block text-[13px] font-medium text-[var(--text-h)] mb-1.5"
            >
              Nova senha
            </label>

            <div className="relative mb-4">
              <input
                id="novaSenha"
                type={mostrarSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                minLength={8}
                required
                autoFocus
                placeholder="Mínimo de 8 caracteres"
                className="w-full border border-[var(--border)] rounded-md px-3 py-2 pr-20 text-[15px] text-[var(--text-h)] bg-[var(--bg)] outline-none focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-bg)]"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--accent)]"
              >
                {mostrarSenha ? 'ocultar' : 'mostrar'}
              </button>
            </div>

            <label
              htmlFor="confirmarSenha"
              className="block text-[13px] font-medium text-[var(--text-h)] mb-1.5"
            >
              Confirmar nova senha
            </label>

            <input
              id="confirmarSenha"
              type={mostrarSenha ? 'text' : 'password'}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              minLength={8}
              required
              placeholder="Repita a nova senha"
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-[15px] text-[var(--text-h)] bg-[var(--bg)] outline-none focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-bg)]"
            />

            {erro && (
              <p className="text-[13px] text-red-600 mt-3">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'enviando' || !token}
              className="mt-6 inline-flex items-center justify-center w-full rounded-md bg-[var(--accent)] text-white text-[15px] font-medium py-2.5 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'enviando'
                ? 'Salvando...'
                : 'Redefinir senha'}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-[var(--text)] text-[15px] mb-6">
              Sua senha foi redefinida com sucesso. Você já pode entrar
              com a nova senha.
            </p>

            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full rounded-md bg-[var(--accent)] text-white text-[15px] font-medium py-2.5 transition-opacity hover:opacity-90"
            >
              Ir para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}