/**
 * components/auth/FormField.jsx
 *
 * Label + input no estilo do protótipo (cartão branco, borda cinza
 * clara, foco rosa). Reaproveitado pelos 3 formulários para manter a
 * mesma aparência sem repetir classes Tailwind em cada tela.
 *
 * Campos type="password" ganham um botão de olho para mostrar ou
 * esconder o que foi digitado. Cada campo controla o seu próprio estado.
 */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormField({ label, required, error, id, type, ...inputProps }) {
  const ehSenha = type === 'password';
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <label htmlFor={id} className="mb-4 block text-left last:mb-0">
      <span className="mb-1.5 block text-sm font-medium text-plum-900">
        {label}
        {required && <span className="text-amora-600"> *</span>}
      </span>
      <span className="relative block">
        <input
          id={id}
          type={ehSenha && mostrarSenha ? 'text' : type}
          {...inputProps}
          aria-invalid={!!error}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-plum-900
            placeholder:text-gray-500 transition
            focus:outline-none focus:ring-2 focus:ring-amora-200 focus:border-amora-400
            ${ehSenha ? 'pr-12' : ''}
            ${error ? 'border-red-400' : 'border-gray-200'}`}
        />
        {ehSenha && (
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={mostrarSenha}
            aria-controls={id}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl
              text-gray-500 transition hover:text-amora-700
              focus:outline-none focus-visible:text-amora-700 focus-visible:ring-2 focus-visible:ring-amora-200"
          >
            {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </span>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
