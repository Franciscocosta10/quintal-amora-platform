import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import UserForm from './UserForm';
import { adicionarUsuario } from '../../services/Admin';

vi.mock('../../services/Admin', () => ({ adicionarUsuario: vi.fn() }));

function alterar(rotulo, valor) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

async function criar() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Criar conta/ }));
  });
}

function preencher(senha = '12345678') {
  alterar('Nome completo', '  Bia Souza ');
  alterar('E-mail', ' bia@email.com ');
  alterar('Senha provisória', senha);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UserForm', () => {
  it('cria a conta com o perfil escolhido e limpa o formulário', async () => {
    const onCriado = vi.fn();
    adicionarUsuario.mockResolvedValue({ id: 9, nomeCompleto: 'Bia Souza' });
    render(<UserForm onCriado={onCriado} />);

    preencher();
    alterar('Perfil', 'administrador');
    await criar();

    expect(adicionarUsuario).toHaveBeenCalledWith({
      nomeCompleto: 'Bia Souza',
      email: 'bia@email.com',
      senha: '12345678',
      perfil: 'administrador'
    });
    expect(onCriado).toHaveBeenCalledWith({ id: 9, nomeCompleto: 'Bia Souza' });
    expect(screen.getByRole('status')).toHaveTextContent('Conta criada!');
    expect(screen.getByLabelText('Nome completo')).toHaveValue('');
    expect(screen.getByLabelText('Perfil')).toHaveValue('visitante');
  });

  it('não envia com campos vazios', async () => {
    render(<UserForm />);
    await criar();

    expect(screen.getByRole('alert')).toHaveTextContent('Preencha o nome, o e-mail e a senha provisória.');
    expect(adicionarUsuario).not.toHaveBeenCalled();
  });

  it('não envia senha curta', async () => {
    render(<UserForm />);
    preencher('123');
    await criar();

    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos 8 caracteres');
    expect(adicionarUsuario).not.toHaveBeenCalled();
  });

  it('mostra o erro do servidor e mantém o que foi digitado', async () => {
    adicionarUsuario.mockRejectedValue(new Error('Este e-mail já está cadastrado.'));
    render(<UserForm />);
    preencher();
    await criar();

    expect(screen.getByRole('alert')).toHaveTextContent('Este e-mail já está cadastrado.');
    expect(screen.getByLabelText('Nome completo')).toHaveValue('  Bia Souza ');
  });
});
