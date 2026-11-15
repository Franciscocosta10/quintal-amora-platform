import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import NotificationForm from './NotificationForm';
import { enviarNotificacao } from '../../services/Notificacao';

vi.mock('../../services/Notificacao', () => ({ enviarNotificacao: vi.fn() }));

function preencher({ titulo = '', mensagem = '', tipo } = {}) {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: titulo } });
  fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: mensagem } });
  if (tipo) {
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: tipo } });
  }
}

function enviar() {
  fireEvent.click(screen.getByRole('button', { name: /Enviar aviso|Enviando/ }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NotificationForm', () => {
  it('envia o aviso sem espaços nas pontas e limpa o formulário', async () => {
    enviarNotificacao.mockResolvedValue({ id: 1 });
    render(<NotificationForm />);

    preencher({ titulo: '  Atraso  ', mensagem: ' Show às 15h ', tipo: 'alteracao_programacao' });
    await act(async () => enviar());

    expect(enviarNotificacao).toHaveBeenCalledWith({
      titulo: 'Atraso',
      mensagem: 'Show às 15h',
      tipo: 'alteracao_programacao'
    });
    expect(screen.getByRole('status')).toHaveTextContent('Aviso enviado!');
    expect(screen.getByLabelText('Título')).toHaveValue('');
    expect(screen.getByLabelText('Tipo')).toHaveValue('aviso_geral');
  });

  it('não envia com título ou mensagem vazios', async () => {
    render(<NotificationForm />);

    preencher({ titulo: 'Só título', mensagem: '   ' });
    await act(async () => enviar());

    expect(enviarNotificacao).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Preencha o título e a mensagem do aviso.');
  });

  it('mostra "Enviando..." e desabilita o botão durante o envio', async () => {
    let concluir;
    enviarNotificacao.mockReturnValue(new Promise((resolve) => { concluir = resolve; }));
    render(<NotificationForm />);

    preencher({ titulo: 'Aviso', mensagem: 'Texto' });
    await act(async () => enviar());

    const botao = screen.getByRole('button', { name: 'Enviando...' });
    expect(botao).toBeDisabled();

    await act(async () => concluir({ id: 1 }));
    expect(screen.getByRole('button', { name: 'Enviar aviso' })).toBeEnabled();
  });

  it('mostra a mensagem de erro da API e mantém o texto digitado', async () => {
    enviarNotificacao.mockRejectedValue(new Error('Acesso permitido somente para administradores.'));
    render(<NotificationForm />);

    preencher({ titulo: 'Aviso', mensagem: 'Texto' });
    await act(async () => enviar());

    expect(screen.getByRole('alert')).toHaveTextContent('Acesso permitido somente para administradores.');
    expect(screen.getByLabelText('Título')).toHaveValue('Aviso');
  });
});
