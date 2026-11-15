import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import NotificationBell from './NotificationBell';
import { listarNotificacoes } from '../services/Notificacao';
import { INTERVALO_ATUALIZACAO_MS } from '../hooks/useNotificacoes';

vi.mock('../services/Notificacao', () => ({ listarNotificacoes: vi.fn() }));

const CHAVE = 'quintalAmora:notificacoesVistasEm';

const ANTIGA = { id: 1, titulo: 'Bem-vindos', mensagem: 'O evento começou!', tipo: 'aviso_geral', createdAt: 1000 };
const NOVA = { id: 2, titulo: 'Cosplay em 10 min', mensagem: 'Palco principal.', tipo: 'chamada_concurso', createdAt: 2000 };

async function renderizar() {
  render(<NotificationBell />);
  await act(async () => {});
}

function botaoSino() {
  return screen.getByRole('button', { name: /Notificações/ });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('NotificationBell', () => {
  it('mostra quantos avisos ainda não foram vistos', async () => {
    listarNotificacoes.mockResolvedValue([NOVA, ANTIGA]);
    await renderizar();

    expect(botaoSino()).toHaveAccessibleName('Notificações (2 novas)');
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('não conta avisos anteriores à última visualização', async () => {
    localStorage.setItem(CHAVE, '1000');
    listarNotificacoes.mockResolvedValue([NOVA, ANTIGA]);
    await renderizar();

    expect(botaoSino()).toHaveAccessibleName('Notificações (1 novas)');
  });

  it('abre a lista de avisos e zera o contador', async () => {
    listarNotificacoes.mockResolvedValue([NOVA, ANTIGA]);
    await renderizar();

    fireEvent.click(botaoSino());

    expect(screen.getByText('Cosplay em 10 min')).toBeInTheDocument();
    expect(screen.getByText('Palco principal.')).toBeInTheDocument();
    expect(screen.getByText(/Chamada de concurso/)).toBeInTheDocument();
    expect(botaoSino()).toHaveAccessibleName('Notificações');
    expect(localStorage.getItem(CHAVE)).toBe('2000');
  });

  it('avisa quando não há nenhum aviso', async () => {
    listarNotificacoes.mockResolvedValue([]);
    await renderizar();

    fireEvent.click(botaoSino());

    expect(screen.getByText('Nenhum aviso por enquanto.')).toBeInTheDocument();
  });

  it('busca avisos novos periodicamente, sem recarregar a página', async () => {
    vi.useFakeTimers();
    listarNotificacoes.mockResolvedValue([ANTIGA]);
    await renderizar();
    expect(botaoSino()).toHaveAccessibleName('Notificações (1 novas)');

    listarNotificacoes.mockResolvedValue([NOVA, ANTIGA]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVALO_ATUALIZACAO_MS);
    });

    expect(listarNotificacoes).toHaveBeenCalledTimes(2);
    expect(botaoSino()).toHaveAccessibleName('Notificações (2 novas)');
  });

  it('mantém a lista atual quando uma busca falha', async () => {
    vi.useFakeTimers();
    listarNotificacoes.mockResolvedValue([ANTIGA]);
    await renderizar();

    listarNotificacoes.mockRejectedValue(new Error('sem conexão'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVALO_ATUALIZACAO_MS);
    });

    fireEvent.click(botaoSino());
    expect(screen.getByText('Bem-vindos')).toBeInTheDocument();
  });
});
