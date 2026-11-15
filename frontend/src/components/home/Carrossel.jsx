import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Carrossel.css';

const DISTANCIA_MINIMA_SWIPE = 40;

// Quem pediu menos movimento no sistema não recebe a troca automática.
function prefereMenosMovimento() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Carrossel de fotos: setas, bolinhas, swipe no celular e troca automática
 * (pausa com o mouse em cima ou com o foco do teclado dentro dele).
 * As fotos aparecem inteiras (sem corte) sobre uma versão desfocada delas mesmas,
 * então funciona com imagens em pé, deitadas ou quadradas.
 */
export default function Carrossel({ imagens, rotulo, intervalo = 5000 }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [automatico] = useState(() => !prefereMenosMovimento());
  const inicioToque = useRef(null);
  const total = imagens.length;

  function irPara(indice) {
    setAtual((indice + total) % total);
  }

  useEffect(() => {
    if (!automatico || pausado || total < 2) return undefined;
    const id = setInterval(() => setAtual((a) => (a + 1) % total), intervalo);
    return () => clearInterval(id);
  }, [automatico, pausado, total, intervalo, atual]);

  if (total === 0) return null;

  function aoTerminarToque(evento) {
    if (inicioToque.current === null) return;
    const distancia = evento.changedTouches[0].clientX - inicioToque.current;
    inicioToque.current = null;
    if (Math.abs(distancia) < DISTANCIA_MINIMA_SWIPE) return;
    irPara(distancia < 0 ? atual + 1 : atual - 1);
  }

  return (
    <section
      className="carrossel"
      aria-roledescription="carrossel"
      aria-label={rotulo}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPausado(false); }}
      onTouchStart={(e) => { inicioToque.current = e.touches[0].clientX; }}
      onTouchEnd={aoTerminarToque}
    >
      <div className="carrossel__trilho" style={{ transform: `translateX(-${atual * 100}%)` }}>
        {imagens.map((imagem, indice) => (
          <div
            key={imagem.src}
            className="carrossel__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${indice + 1} de ${total}`}
            aria-hidden={indice !== atual}
          >
            <div className="carrossel__fundo" style={{ backgroundImage: `url("${imagem.src}")` }} aria-hidden="true" />
            <img src={imagem.src} alt={imagem.alt} className="carrossel__imagem" draggable="false" />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button type="button" className="carrossel__seta carrossel__seta--anterior" onClick={() => irPara(atual - 1)} aria-label="Foto anterior">
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button type="button" className="carrossel__seta carrossel__seta--proxima" onClick={() => irPara(atual + 1)} aria-label="Próxima foto">
            <ChevronRight size={22} aria-hidden="true" />
          </button>

          <div className="carrossel__bolinhas">
            {imagens.map((imagem, indice) => (
              <button
                key={imagem.src}
                type="button"
                className={`carrossel__bolinha ${indice === atual ? 'carrossel__bolinha--ativa' : ''}`}
                onClick={() => irPara(indice)}
                aria-label={`Ir para a foto ${indice + 1}`}
                aria-current={indice === atual ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
