import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const USUARIO = { nomeCompleto: 'Francisco Marcelo Caetano Costa', email: 'francisco@email.com', fotoPerfil: null };
const logout = vi.fn();

function autenticacao(dados) {
  return { usuario: USUARIO, isAuthenticated: true, carregando: false, logout, ...dados };
}

function renderizar() {
  render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/home" element={<Header />} />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  logout.mockResolvedValue();
});

describe('Header', () => {
  it('mostra o usuário logado: primeiro nome no botão, iniciais sem foto e dados no menu', () => {
    useAuth.mockReturnValue(autenticacao());
    renderizar();

    expect(screen.getByText('Francisco')).toBeInTheDocument();
    expect(screen.getByText('FC')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Francisco/ }));
    expect(screen.getByText('Francisco Marcelo Caetano Costa')).toBeInTheDocument();
    expect(screen.getByText('francisco@email.com')).toBeInTheDocument();
  });

  it('usa a foto de perfil quando existe', () => {
    useAuth.mockReturnValue(autenticacao({ usuario: { ...USUARIO, fotoPerfil: 'https://foto.com/eu.png' } }));
    renderizar();

    expect(screen.getByRole('img', { name: 'Foto de perfil' })).toHaveAttribute('src', 'https://foto.com/eu.png');
  });

  it('"Sair" encerra a sessão e leva para o login', async () => {
    useAuth.mockReturnValue(autenticacao());
    renderizar();

    fireEvent.click(screen.getByRole('button', { name: /Francisco/ }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Sair' })));

    expect(logout).toHaveBeenCalled();
    expect(screen.getByText('Tela de login')).toBeInTheDocument();
  });

  it('sem login mostra Entrar e Cadastrar', () => {
    useAuth.mockReturnValue(autenticacao({ usuario: null, isAuthenticated: false }));
    renderizar();

    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  it('enquanto carrega não mostra nem o menu nem Entrar/Cadastrar', () => {
    useAuth.mockReturnValue(autenticacao({ usuario: null, isAuthenticated: false, carregando: true }));
    renderizar();

    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument();
    expect(screen.queryByText('Francisco')).not.toBeInTheDocument();
  });
});
