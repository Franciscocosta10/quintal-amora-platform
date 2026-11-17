import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminUsers from './AdminUsers';
import { alterarUsuario, listarUsuarios } from '../../services/Admin';

vi.mock('../../services/Admin', () => ({
  listarUsuarios: vi.fn(),
  alterarUsuario: vi.fn(),
  adicionarUsuario: vi.fn()
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ usuario: { id: 1, perfil: 'administrador' } })
}));

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <main>{children}</main>
}));

const CRIADO = new Date(2026, 4, 10).getTime();

const USUARIOS = [
  { id: 1, nomeCompleto: 'Admin Geral', email: 'admin@email.com', perfil: 'administrador', ativo: true, createdAt: CRIADO },
  { id: 2, nomeCompleto: 'José Lima', email: 'jose@email.com', perfil: 'visitante', ativo: true, createdAt: CRIADO },
  { id: 3, nomeCompleto: 'Luiza Helena', email: 'luiza@email.com', perfil: 'administrador', ativo: false, createdAt: CRIADO }
];

async function renderizar() {
  render(
    <MemoryRouter>
      <AdminUsers />
    </MemoryRouter>
  );
  await act(async () => {});
}

function linha(nome) {
  return within(screen.getByText(nome).closest('li'));
}

beforeEach(() => {
  vi.clearAllMocks();
  listarUsuarios.mockResolvedValue(USUARIOS);
});

describe('AdminUsers', () => {
  it('lista os usuários com perfil, situação e sem botões na própria conta', async () => {
    await renderizar();

    expect(screen.getByRole('heading', { name: /Todos os usuários \(3\)/ })).toBeInTheDocument();
    expect(linha('Admin Geral').getByText('Você')).toBeInTheDocument();
    expect(linha('Admin Geral').queryByRole('button')).not.toBeInTheDocument();
    expect(linha('José Lima').getByText('Participante')).toBeInTheDocument();
    expect(linha('Luiza Helena').getByText('Inativo')).toBeInTheDocument();
    expect(linha('Luiza Helena').getByRole('button', { name: 'Reativar' })).toBeInTheDocument();
  });

  it('busca por nome sem diferenciar acento e por e-mail', async () => {
    await renderizar();

    fireEvent.change(screen.getByLabelText('Buscar usuário'), { target: { value: 'jose' } });
    expect(screen.getByText('José Lima')).toBeInTheDocument();
    expect(screen.queryByText('Luiza Helena')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar usuário'), { target: { value: 'nada@x' } });
    expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument();
  });

  it('desativa um usuário e atualiza a linha', async () => {
    alterarUsuario.mockResolvedValue({ ...USUARIOS[1], ativo: false });
    await renderizar();

    await act(async () => fireEvent.click(linha('José Lima').getByRole('button', { name: 'Desativar' })));

    expect(alterarUsuario).toHaveBeenCalledWith(2, { ativo: false });
    expect(linha('José Lima').getByText('Inativo')).toBeInTheDocument();
    expect(linha('José Lima').getByRole('button', { name: 'Reativar' })).toBeInTheDocument();
  });

  it('torna um participante administrador', async () => {
    alterarUsuario.mockResolvedValue({ ...USUARIOS[1], perfil: 'administrador' });
    await renderizar();

    await act(async () => fireEvent.click(linha('José Lima').getByRole('button', { name: 'Tornar admin' })));

    expect(alterarUsuario).toHaveBeenCalledWith(2, { perfil: 'administrador' });
    expect(linha('José Lima').getByRole('button', { name: 'Tornar participante' })).toBeInTheDocument();
  });

  it('mostra o erro ao alterar', async () => {
    alterarUsuario.mockRejectedValue(new Error('Sem permissão.'));
    await renderizar();

    await act(async () => fireEvent.click(linha('José Lima').getByRole('button', { name: 'Desativar' })));

    expect(screen.getByRole('alert')).toHaveTextContent('Sem permissão.');
  });

  it('mostra o erro ao carregar', async () => {
    listarUsuarios.mockRejectedValue(new Error('x'));
    await renderizar();

    expect(screen.getByRole('alert')).toHaveTextContent('x');
    expect(screen.queryByLabelText('Buscar usuário')).not.toBeInTheDocument();
  });
});
