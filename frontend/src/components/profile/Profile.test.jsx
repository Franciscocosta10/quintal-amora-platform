import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import { useAuth } from '../../hooks/useAuth';
import { atualizarDadosPerfil } from '../../services/perfil';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../services/perfil', () => ({ atualizarDadosPerfil: vi.fn() }));

const USUARIO = { id: 1, nomeCompleto: 'Ana Souza', email: 'ana@email.com', perfil: 'visitante' };

function autenticacao(dados) {
  return { usuario: null, carregando: false, isAdmin: false, atualizarUsuario: vi.fn(), ...dados };
}

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <Profile />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Profile', () => {
  it('preenche nome e e-mail mesmo quando o usuário termina de carregar depois de abrir', () => {
    // Abrindo /profile direto pela URL: o /auth/me ainda não respondeu.
    useAuth.mockReturnValue(autenticacao({ carregando: true }));
    const { rerender } = renderizar();
    expect(screen.getByText('Carregando seus dados…')).toBeInTheDocument();

    useAuth.mockReturnValue(autenticacao({ usuario: USUARIO }));
    rerender(
      <MemoryRouter initialEntries={['/profile']}>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza');
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@email.com');
  });

  it('está em português', () => {
    useAuth.mockReturnValue(autenticacao({ usuario: USUARIO }));
    renderizar();

    expect(screen.getByRole('dialog', { name: 'Minha conta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  describe('salvar alterações', () => {
    const digitar = (rotulo, valor) => fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
    const salvar = () => act(async () => fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' })));

    it('fica desabilitado enquanto nada mudou', () => {
      useAuth.mockReturnValue(autenticacao({ usuario: USUARIO }));
      renderizar();

      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
      digitar('E-mail', ' ANA@email.com ');
      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    });

    it('envia nome e e-mail, recarrega o usuário e avisa na tela', async () => {
      vi.useFakeTimers();
      const atualizarUsuario = vi.fn().mockResolvedValue({});
      atualizarDadosPerfil.mockResolvedValue({});
      useAuth.mockReturnValue(autenticacao({ usuario: USUARIO, atualizarUsuario }));
      renderizar();

      digitar('Nome', 'Ana Maria Souza');
      digitar('E-mail', 'ana.maria@email.com');
      await salvar();

      expect(atualizarDadosPerfil).toHaveBeenCalledWith({ nomeCompleto: 'Ana Maria Souza', email: 'ana.maria@email.com' });
      expect(atualizarUsuario).toHaveBeenCalled();
      expect(screen.getByRole('status')).toHaveTextContent('Dados do perfil atualizados com sucesso!');

      act(() => vi.advanceTimersByTime(3000));
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    it('mostra o erro do backend (ex.: e-mail de outra conta)', async () => {
      atualizarDadosPerfil.mockRejectedValue(new Error('Este e-mail já está sendo usado por outra conta.'));
      useAuth.mockReturnValue(autenticacao({ usuario: USUARIO }));
      renderizar();

      digitar('E-mail', 'outra@email.com');
      await salvar();

      expect(screen.getByRole('alert')).toHaveTextContent('Este e-mail já está sendo usado por outra conta.');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
    });
  });
});
