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

/**
 * DatePicker — mesmo contrato de um <input type="date">: recebe `value`
 * em formato ISO ('YYYY-MM-DD') e dispara `onChange({ target: { name, value } })`,
 * pra plugar direto no handleChange que ScheduleForm/ContestForm já usam,
 * sem precisar reescrever a lógica de estado desses formulários.
 */
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

  useEffect(() => {
    function aoClicarFora(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  function abrirNoMesDoValor() {
    if (value) {
      setAnoVisivel(Number(value.split('-')[0]));
      setMesVisivel(Number(value.split('-')[1]) - 1);
    }
    setAberto(true);
  }

  function selecionarDia(dia) {
    onChange({ target: { name, value: paraISO(anoVisivel, mesVisivel, dia) } });
    setAberto(false);
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
    <div className="date-picker" ref={containerRef}>
      <input
        type="text"
        id={id}
        readOnly
        value={formatarParaExibicao(value)}
        placeholder={placeholder}
        onClick={abrirNoMesDoValor}
        onFocus={abrirNoMesDoValor}
        required={required}
      />

      {aberto && (
        <div className="date-picker__popover" role="dialog" aria-label="Selecionar data">
          <div className="date-picker__header">
            <button type="button" onClick={mesAnterior} aria-label="Mês anterior">‹</button>
            <span>{MESES[mesVisivel]} {anoVisivel}</span>
            <button type="button" onClick={mesSeguinte} aria-label="Próximo mês">›</button>
          </div>

          <div className="date-picker__dias-semana">
            {DIAS_SEMANA.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="date-picker__grade">
            {celulas.map((dia, i) => {
              if (dia === null) {
                return <span key={`vazio-${i}`} className="date-picker__dia date-picker__dia--vazio" />;
              }

              const isoDoDia = paraISO(anoVisivel, mesVisivel, dia);

              return (
                <button
                  key={isoDoDia}
                  type="button"
                  className={`date-picker__dia ${isoDoDia === value ? 'is-selected' : ''} ${isoDoDia === hojeISO ? 'is-today' : ''}`}
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