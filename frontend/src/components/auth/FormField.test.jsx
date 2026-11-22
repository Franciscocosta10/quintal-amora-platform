import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import FormField from './FormField';

describe('FormField', () => {
  it('campo comum não tem botão de mostrar senha', () => {
    render(<FormField id="email" label="Email" type="email" value="" onChange={() => {}} />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('campo de senha começa escondido e alterna ao clicar no olho', () => {
    render(<FormField id="senha" label="Senha" type="password" value="segredo123" onChange={() => {}} />);
    const campo = screen.getByLabelText('Senha');

    expect(campo).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(campo).toHaveAttribute('type', 'text');
    expect(campo).toHaveValue('segredo123');
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(campo).toHaveAttribute('type', 'password');
  });

  it('o botão do olho não envia o formulário', () => {
    const enviar = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={enviar}>
        <FormField id="senha" label="Senha" type="password" value="" onChange={() => {}} />
      </form>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));

    expect(enviar).not.toHaveBeenCalled();
  });

  it('cada campo de senha controla a própria visibilidade', () => {
    render(
      <>
        <FormField id="senha" label="Senha" type="password" value="" onChange={() => {}} />
        <FormField id="confirmarSenha" label="Confirmar senha" type="password" value="" onChange={() => {}} />
      </>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Mostrar senha' })[0]);

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Confirmar senha')).toHaveAttribute('type', 'password');
  });
});
