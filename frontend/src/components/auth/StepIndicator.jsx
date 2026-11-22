/**
 * Indicador das etapas da recuperação de senha (E-mail → Verificação →
 * Nova senha). `etapaAtual` vai de 1 a 3.
 */

const ETAPAS = [
  { numero: 1, titulo: 'E-mail', legenda: 'Informe seu e-mail' },
  { numero: 2, titulo: 'Verificação', legenda: 'Verifique seu email' },
  { numero: 3, titulo: 'Nova senha', legenda: 'Crie uma nova senha' },
];

export default function StepIndicator({ etapaAtual = 1 }) {
  return (
    <div className="mb-6 flex items-start">
      {ETAPAS.map((etapa, index) => {
        const ativa = etapa.numero === etapaAtual;
        const concluida = etapa.numero < etapaAtual;
        const destacada = ativa || concluida;

        return (
          <div key={etapa.numero} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold
                  ${destacada ? 'bg-amora-600 text-white' : 'border-2 border-gray-200 text-gray-400'}`}
              >
                {etapa.numero}
              </span>
              {index < ETAPAS.length - 1 && (
                <span className={`mx-1 h-0.5 flex-1 ${concluida ? 'bg-amora-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <span className={`mt-1.5 text-xs font-semibold ${ativa ? 'text-amora-600' : 'text-gray-400'}`}>
              {etapa.titulo}
            </span>
            <span className={`text-[10px] ${ativa ? 'text-amora-400' : 'text-gray-300'}`}>
              {etapa.legenda}
            </span>
          </div>
        );
      })}
    </div>
  );
}
