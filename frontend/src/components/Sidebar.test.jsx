import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

function renderizar() {
  render(
    <MemoryRouter initialEntries={['/checkin']}>
      <Sidebar />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({ isAdmin: false });
});

describe('Sidebar', () => {
  it('mostra os links do visitante, com o da página atual destacado', () => {
    renderizar();

    expect(screen.getByRole('link', { name: 'Check-in' })).toHaveClass('is-active');
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveClass('is-active');
    expect(screen.queryByRole('link', { name: 'Painel admin' })).not.toBeInTheDocument();
  });

  it('mostra o Painel admin para administradores', () => {
    useAuth.mockReturnValue({ isAdmin: true });
    renderizar();

    expect(screen.getByRole('link', { name: 'Painel admin' })).toBeInTheDocument();
  });

  // No celular o CSS esconde os links até a sidebar ter a classe sidebar--aberta.
  it('abre e fecha o menu do celular pelo botão ☰', () => {
    renderizar();
    const sidebar = screen.getByRole('complementary');

    const botao = screen.getByRole('button', { name: 'Abrir menu' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar).not.toHaveClass('sidebar--aberta');

    fireEvent.click(botao);
    expect(sidebar).toHaveClass('sidebar--aberta');
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Fechar menu' }));
    expect(sidebar).not.toHaveClass('sidebar--aberta');
  });
});
