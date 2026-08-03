/**
 * components/auth/AuthLayout.jsx
 *
 * Painel esquerdo idêntico nas 3 telas do protótipo (marca, boas-vindas
 * e a barra de 4 destaques) — centralizado aqui para não duplicar em
 * cada página. `children` é o conteúdo da coluna direita (o cartão de
 * cada tela).
 *
 * No mobile, o painel esquerdo some (a ilustração é decorativa, não
 * essencial para usar o formulário) e sobra só o cartão, centralizado.
 */

import SakuraDecoration from './decoration';

const DESTAQUES = [
  {
    label: 'Participe de eventos incríveis',
    icon: (
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 10v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    label: 'Acompanhe a programação',
    icon: (
      <path d="M8 2v4M16 2v4M3.5 9h17M4 5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    ),
  },
  {
    label: 'Inscreva-se em concursos',
    icon: (
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 5H4a2 2 0 0 0 2 4M17 5h3a2 2 0 0 1-2 4" />
    ),
  },
  {
    label: 'Conheça lojas e artistas',
    icon: (
      <path d="M3 9.5 4.5 4h15L21 9.5M3 9.5a2.5 2.5 0 0 0 5 0M8 9.5a2.5 2.5 0 0 0 5 0M13 9.5a2.5 2.5 0 0 0 5 0M18 9.5a2.5 2.5 0 0 0 3 0M4 9.5V20h16V9.5" />
    ),
  },
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-amora-50">
      {/* Painel esquerdo — decorativo, escondido em telas pequenas */}
      <aside className="hidden lg:flex lg:w-[38%] relative flex-col justify-between overflow-hidden bg-gradient-to-b from-amora-100 via-amora-50 to-white px-10 pb-8 pt-10">
        <SakuraDecoration className="pointer-events-none absolute -left-6 -top-4 h-48 w-64" />
        <SakuraDecoration className="pointer-events-none absolute -right-16 top-1/3 h-40 w-52 rotate-90 opacity-60" />

        <div className="relative z-10">
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-xl font-bold text-plum-900">Quintal</h2>
            <h2 className="text-xl font-bold text-amora-500">da Amora 🌸</h2>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">Cultura geek e otaku</p>

          <h1 className="mt-10 text-3xl font-bold leading-snug text-plum-900">
            Bem-vindo ao<br />Quintal da Amora!
          </h1>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            Sua experiência geek e otaku começa aqui.
          </p>
        </div>

        {/* Espaço reservado para a ilustração real (ex.: exportada do
            Figma). Troque este bloco por:
            <img src="/src/assets/hero-illustration.png" alt="" className="..." /> */}
        <div className="relative z-10 flex flex-1 items-center justify-center" aria-hidden="true">
          <SakuraDecoration className="h-40 w-40 opacity-70" />
        </div>

        <div className="relative z-10 grid grid-cols-4 gap-2 rounded-2xl border border-amora-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          {DESTAQUES.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-amora-500"
              >
                {item.icon}
              </svg>
              <span className="text-[11px] leading-tight text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Painel direito — conteúdo específico de cada tela */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
