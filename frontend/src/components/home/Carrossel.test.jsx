import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Carrossel from './Carrossel';

const IMAGENS = [
  { src: '/a.png', alt: 'Foto A' },
  { src: '/b.png', alt: 'Foto B' },
  { src: '/c.png', alt: 'Foto C' }
];

function slideVisivel() {
  return screen.getAllByRole('img', { hidden: true }).find((img) => img.closest('[aria-hidden="false"]')).alt;
}

function renderizar(props) {
  return render(<Carrossel imagens={IMAGENS} rotulo="Fotos do evento" {...props} />);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  delete window.matchMedia;
});

describe('Carrossel', () => {
  it('começa na primeira foto e navega pelas setas, voltando ao início/fim', () => {
    renderizar();
    expect(screen.getByRole('region', { name: 'Fotos do evento' })).toBeInTheDocument();
    expect(slideVisivel()).toBe('Foto A');

    fireEvent.click(screen.getByRole('button', { name: 'Próxima foto' }));
    expect(slideVisivel()).toBe('Foto B');

    fireEvent.click(screen.getByRole('button', { name: 'Foto anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Foto anterior' }));
    expect(slideVisivel()).toBe('Foto C');
  });

  it('vai direto para a foto escolhida nas bolinhas', () => {
    renderizar();
    fireEvent.click(screen.getByRole('button', { name: 'Ir para a foto 3' }));

    expect(slideVisivel()).toBe('Foto C');
    expect(screen.getByRole('button', { name: 'Ir para a foto 3' })).toHaveAttribute('aria-current', 'true');
  });

  it('troca sozinho e pausa com o mouse ou o foco dentro', () => {
    renderizar({ intervalo: 1000 });
    act(() => vi.advanceTimersByTime(1000));
    expect(slideVisivel()).toBe('Foto B');

    const carrossel = screen.getByRole('region');
    fireEvent.mouseEnter(carrossel);
    act(() => vi.advanceTimersByTime(3000));
    expect(slideVisivel()).toBe('Foto B');

    fireEvent.mouseLeave(carrossel);
    act(() => vi.advanceTimersByTime(1000));
    expect(slideVisivel()).toBe('Foto C');

    const seta = screen.getByRole('button', { name: 'Próxima foto' });
    fireEvent.focus(seta);
    act(() => vi.advanceTimersByTime(3000));
    expect(slideVisivel()).toBe('Foto C');

    // Foco passando de um botão para outro do carrossel continua pausado.
    fireEvent.blur(seta, { relatedTarget: screen.getByRole('button', { name: 'Foto anterior' }) });
    act(() => vi.advanceTimersByTime(3000));
    expect(slideVisivel()).toBe('Foto C');

    fireEvent.blur(seta, { relatedTarget: document.body });
    act(() => vi.advanceTimersByTime(1000));
    expect(slideVisivel()).toBe('Foto A');
  });

  it('não troca sozinho para quem prefere menos movimento', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    renderizar({ intervalo: 1000 });

    act(() => vi.advanceTimersByTime(5000));
    expect(slideVisivel()).toBe('Foto A');
  });

  it('arrasta com o dedo para os lados e ignora toques curtos', () => {
    renderizar();
    const carrossel = screen.getByRole('region');
    const arrastar = (de, ate) => {
      fireEvent.touchStart(carrossel, { touches: [{ clientX: de }] });
      fireEvent.touchEnd(carrossel, { changedTouches: [{ clientX: ate }] });
    };

    arrastar(300, 100);
    expect(slideVisivel()).toBe('Foto B');

    arrastar(100, 300);
    expect(slideVisivel()).toBe('Foto A');

    arrastar(200, 190);
    expect(slideVisivel()).toBe('Foto A');

    fireEvent.touchEnd(carrossel, { changedTouches: [{ clientX: 0 }] });
    expect(slideVisivel()).toBe('Foto A');
  });

  it('com uma foto só não mostra controles e com nenhuma não mostra nada', () => {
    const { container, rerender } = renderizar({ imagens: [IMAGENS[0]] });
    expect(screen.getByRole('img', { name: 'Foto A' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<Carrossel imagens={[]} rotulo="Fotos do evento" />);
    expect(container).toBeEmptyDOMElement();
  });
});
