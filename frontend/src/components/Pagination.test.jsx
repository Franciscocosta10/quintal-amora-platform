import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  function renderizar(paginaAtual, totalPaginas = 10) {
    const onMudarPagina = vi.fn();
    const utilitarios = render(
      <Pagination paginaAtual={paginaAtual} totalPaginas={totalPaginas} onMudarPagina={onMudarPagina} />
    );
    return { ...utilitarios, onMudarPagina };
  }

  it('não renderiza nada com uma página só', () => {
    const { container } = renderizar(1, 1);
    expect(container).toBeEmptyDOMElement();
  });

  it('marca a página atual e mostra as reticências', () => {
    renderizar(1);

    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Página 2' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('desativa "Anterior" na primeira página e "Próximo" na última', () => {
    const { unmount } = renderizar(1);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();
    unmount();

    renderizar(10);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });

  it('avisa a página escolhida pelas setas e pelos números', () => {
    const { onMudarPagina } = renderizar(5);

    fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(onMudarPagina).toHaveBeenLastCalledWith(4);

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(onMudarPagina).toHaveBeenLastCalledWith(6);

    fireEvent.click(screen.getByRole('button', { name: 'Página 10' }));
    expect(onMudarPagina).toHaveBeenLastCalledWith(10);
  });

  it('aceita uma classe extra para posicionamento', () => {
    render(<Pagination paginaAtual={1} totalPaginas={2} onMudarPagina={() => {}} className="extra" />);
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveClass('paginacao', 'extra');
  });
});
