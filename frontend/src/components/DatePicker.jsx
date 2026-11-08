import { useEffect, useRef, useState } from 'react';
import './DatePicker.css';

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function paraISO(ano, mes, dia) {
  const mm = String(mes + 1).padStart(2, '0');
  const dd = String(dia).padStart(2, '0');
  return `${ano}-${mm}-${dd}`;
}

function formatarParaExibicao(valorISO) {
  if (!valorISO) return '';
  const [ano, mes, dia] = valorISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarParaLeitorDeTela(ano, mes, dia) {
  return new Date(ano, mes, dia).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export default function DatePicker({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder = 'dd/mm/aaaa'
}) {
  const [aberto, setAberto] = useState(false);
  const [anoVisivel, setAnoVisivel] = useState(() =>
    value ? Number(value.split('-')[0]) : new Date().getFullYear()
  );
  const [mesVisivel, setMesVisivel] = useState(() =>
    value ? Number(value.split('-')[1]) - 1 : new Date().getMonth()
  );

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const devolvendoFocoRef = useRef(false);

  useEffect(() => {
    function aoClicarFora(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  // Devolve o foco ao input sem disparar o onFocus, que reabriria o calendário
  // logo depois de fechá-lo.
  function fechar() {
    setAberto(false);
    devolvendoFocoRef.current = true;
    inputRef.current?.focus();
    devolvendoFocoRef.current = false;
  }

  function aoFocarInput() {
    if (!devolvendoFocoRef.current) abrirNoMesDoValor();
  }

  function aoPressionarTecla(event) {
    if (event.key === 'Escape' && aberto) {
      event.stopPropagation();
      fechar();
    }
  }

  function abrirNoMesDoValor() {
    if (value) {
      setAnoVisivel(Number(value.split('-')[0]));
      setMesVisivel(Number(value.split('-')[1]) - 1);
    }
    setAberto(true);
  }

  function selecionarDia(dia) {
    onChange({ target: { name, value: paraISO(anoVisivel, mesVisivel, dia) } });
    fechar();
  }

  function mesAnterior() {
    if (mesVisivel === 0) {
      setMesVisivel(11);
      setAnoVisivel((a) => a - 1);
    } else {
      setMesVisivel((m) => m - 1);
    }
  }

  function mesSeguinte() {
    if (mesVisivel === 11) {
      setMesVisivel(0);
      setAnoVisivel((a) => a + 1);
    } else {
      setMesVisivel((m) => m + 1);
    }
  }

  const primeiroDiaDoMes = new Date(anoVisivel, mesVisivel, 1).getDay();
  const totalDiasDoMes = new Date(anoVisivel, mesVisivel + 1, 0).getDate();

  const hojeISO = (() => {
    const hoje = new Date();
    return paraISO(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  })();

  const celulas = [];
  for (let i = 0; i < primeiroDiaDoMes; i++) celulas.push(null);
  for (let dia = 1; dia <= totalDiasDoMes; dia++) celulas.push(dia);

  return (
    <div className="date-picker" ref={containerRef} onKeyDown={aoPressionarTecla}>
      <input
        ref={inputRef}
        type="text"
        id={id}
        readOnly
        value={formatarParaExibicao(value)}
        placeholder={placeholder}
        onClick={abrirNoMesDoValor}
        onFocus={aoFocarInput}
        required={required}
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={aberto ? `${id}-calendario` : undefined}
        autoComplete="off"
      />

      {aberto && (
        <div
          id={`${id}-calendario`}
          className="date-picker__popover"
          role="dialog"
          aria-modal="false"
          aria-label="Selecionar data"
        >
          <div className="date-picker__header">
            <button type="button" onClick={mesAnterior} aria-label="Mês anterior">‹</button>
            <span aria-live="polite">{MESES[mesVisivel]} {anoVisivel}</span>
            <button type="button" onClick={mesSeguinte} aria-label="Próximo mês">›</button>
          </div>

          <div className="date-picker__dias-semana" aria-hidden="true">
            {DIAS_SEMANA.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="date-picker__grade" role="grid">
            {celulas.map((dia, i) => {
              if (dia === null) {
                return (
                  <span
                    key={`vazio-${i}`}
                    className="date-picker__dia date-picker__dia--vazio"
                    aria-hidden="true"
                  />
                );
              }

              const isoDoDia = paraISO(anoVisivel, mesVisivel, dia);
              const selecionado = isoDoDia === value;
              const ehHoje = isoDoDia === hojeISO;

              return (
                <button
                  key={isoDoDia}
                  type="button"
                  role="gridcell"
                  className={`date-picker__dia ${selecionado ? 'is-selected' : ''} ${ehHoje ? 'is-today' : ''}`}
                  aria-selected={selecionado}
                  aria-current={ehHoje ? 'date' : undefined}
                  aria-label={formatarParaLeitorDeTela(anoVisivel, mesVisivel, dia)}
                  onClick={() => selecionarDia(dia)}
                >
                  {dia}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}