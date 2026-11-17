import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import { useAuth } from '../../hooks/useAuth';

// Quem abre o link do QR do totem sem estar logado passa pelo login (ou
// cadastro) e volta para o mesmo link, com o ?qr= intacto.

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const LINK_DO_TOTEM = '/checkin?qr=checkin%3Aevento%3A3';

let autenticado;
const login = vi.fn(async () => { autenticado = true; });
const cadastrar = vi.fn(async () => { autenticado = true; });

function TelaDeCheckin() {
  const location = useLocation();
  return <p>Check-in aberto em {location.pathname + location.search}</p>;
}

function renderizar(rota) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/checkin" element={<ProtectedRoute><TelaDeCheckin /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="/home" element={<p>Home</p>} />
        <Route path="/" element={<p>Início</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function preencher(rotulo, valor) {
  fireEvent.change(screen.getByLabelText(new RegExp(`^${rotulo}`)), { target: { value: valor } });
}

async function entrar() {
  preencher('Email', 'ana@email.com');
  preencher('Senha', '12345678');
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Entrar' })));
}

beforeEach(() => {
  vi.clearAllMocks();
  autenticado = false;
  useAuth.mockImplementation(() => ({
    isAuthenticated: autenticado,
    carregando: false,
    login,
    cadastrar
  }));
});

describe('voltar para a página de origem depois de entrar', () => {
  it('sem login, o link do QR leva ao login e volta para o link depois de entrar', async () => {
    renderizar(LINK_DO_TOTEM);
    expect(screen.getByRole('heading', { name: 'Fazer login' })).toBeInTheDocument();

    await entrar();

    expect(login).toHaveBeenCalledWith('ana@email.com', '12345678');
    expect(screen.getByText(`Check-in aberto em ${LINK_DO_TOTEM}`)).toBeInTheDocument();
  });

  it('quem ainda não tem conta se cadastra e também volta para o link', async () => {
    renderizar(LINK_DO_TOTEM);
    fireEvent.click(screen.getByRole('link', { name: 'Cadastre-se' }));

    preencher('Nome completo', 'Ana Lima');
    preencher('Email', 'ana@email.com');
    preencher('Senha', '12345678');
    preencher('Confirmar senha', '12345678');
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Criar conta' })));

    expect(cadastrar).toHaveBeenCalled();
    expect(screen.getByText(`Check-in aberto em ${LINK_DO_TOTEM}`)).toBeInTheDocument();
  });

  it('já logado, abre o link direto', () => {
    autenticado = true;
    renderizar(LINK_DO_TOTEM);

    expect(screen.getByText(`Check-in aberto em ${LINK_DO_TOTEM}`)).toBeInTheDocument();
  });

  it('login aberto direto continua indo para a Home', async () => {
    renderizar('/login');

    await entrar();

    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
