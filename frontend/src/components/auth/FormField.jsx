/**
 * components/auth/FormField.jsx
 *
 * Label + input no estilo do protótipo (cartão branco, borda cinza
 * clara, foco rosa). Reaproveitado pelos 3 formulários para manter a
 * mesma aparência sem repetir classes Tailwind em cada tela.
 */

export default function FormField({ label, required, error, id, ...inputProps }) {
  return (
    <label htmlFor={id} className="mb-4 block text-left last:mb-0">
      <span className="mb-1.5 block text-sm font-medium text-plum-900">
        {label}
        {required && <span className="text-amora-500"> *</span>}
      </span>
      <input
        id={id}
        {...inputProps}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-plum-900
          placeholder:text-gray-400 transition
          focus:outline-none focus:ring-2 focus:ring-amora-200 focus:border-amora-400
          ${error ? 'border-red-400' : 'border-gray-200'}`}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
