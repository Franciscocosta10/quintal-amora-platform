/**
 * pages/HomePage.jsx
 *
 * Placeholder temporário. Não fazia parte do pedido das 3 telas, mas
 * sem uma rota "/" o login não tem pra onde ir depois de autenticar.
 * Quando a Etapa 2 (Programação) começar, esta página vira o ponto de
 * entrada real do app logado.
 */

import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { usuario, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-amora-50 px-6 text-center">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        Área logada · placeholder (próximos módulos entram aqui)
      </p>
      <h1 className="text-2xl font-bold text-plum-900">Olá, {usuario?.nomeCompleto}! 🌸</h1>
      <p className="text-sm text-gray-500">Perfil: {usuario?.perfil}</p>
      <button
        type="button"
        onClick={logout}
        className="mt-4 rounded-xl bg-amora-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amora-600"
      >
        Sair
      </button>
    </div>
  );
}
