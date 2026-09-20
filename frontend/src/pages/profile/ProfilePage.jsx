import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import FormField from '../../components/auth/FormField';

export default function ProfilePage() {
  const [name, setName] = useState('Visitante Geek');
  const [email, setEmail] = useState('visitante@email.com');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setEnviando(true);
    // Lógica de salvamento...
    setTimeout(() => setEnviando(false), 1000);
  }

  return (
    <AuthLayout>
      {/* 1. Ícone flutuante e título centralizado com sublinhado (Igual ao Criar Conta) */}
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amora-500 text-white shadow-sm shadow-amora-200">
          {/* Ícone de usuário simples */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <h1 className="text-lg font-semibold text-plum-900 underline decoration-amora-200 underline-offset-4">
          My Account
        </h1>
      </div>

      {/* 2. Cartão branco com cantos arredondados e sombra colorida */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(238,61,108,0.25)]"
      >
        <FormField
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="mt-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* 3. Botão de largura total igual ao da tela de login */}
        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-xl bg-amora-500 py-3 text-sm font-semibold text-white transition hover:bg-amora-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center text-center text-sm">
        <Link to="/home" className="font-medium text-amora-500 hover:text-amora-600">
          Cancel & Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
}