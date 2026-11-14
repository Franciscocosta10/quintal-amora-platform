import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ModalPagina from './ModalPagina';
import { useFecharModalPagina } from '../hooks/useFecharModalPagina';

describe('ModalPagina', () => {
  function renderizar() {
    const onFechar = vi.fn();
    render(
      <ModalPagina titulo="Minha conta" onFechar={onFechar}>
        <button type="button">Dentro</button>
      </ModalPagina>
    );
    return onFechar;
  }

  it('fecha pelo X, pelo Esc e clicando fora do cartão', () => {
    const onFechar = renderizar();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(document.querySelector('.modal-pagina'));

    expect(onFechar).toHaveBeenCalledTimes(3);
  });

  it('não fecha ao clicar dentro do cartão nem com outras teclas', () => {
    const onFechar = renderizar();

    fireEvent.click(screen.getByRole('button', { name: 'Dentro' }));
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(screen.getByRole('dialog', { name: 'Minha conta' })).toBeInTheDocument();
    expect(onFechar).not.toHaveBeenCalled();
  });
});

describe('useFecharModalPagina', () => {
  function BotaoFechar() {
    const fechar = useFecharModalPagina();
    return <button onClick={fechar}>Cancelar</button>;
  }

  function Onde() {
    return <p>em {useLocation().pathname}</p>;
  }

  function renderizar(entradas, indice) {
    render(
      <MemoryRouter initialEntries={entradas} initialIndex={indice}>
        <Routes>
          <Route path="/profile" element={<BotaoFechar />} />
          <Route path="*" element={<Onde />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('aberta pelo menu, volta para a tela de onde veio', () => {
    renderizar(['/catalogo', { pathname: '/profile', state: { background: { pathname: '/catalogo' } } }], 1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('em /catalogo')).toBeInTheDocument();
  });

  it('acessada direto pela URL, vai para a Home (/home), não para o login (/)', () => {
    renderizar(['/profile'], 0);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('em /home')).toBeInTheDocument();
  });
});
