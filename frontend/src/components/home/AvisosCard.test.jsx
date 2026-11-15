import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import AvisosCard from './AvisosCard';
import { listarNotificacoes } from '../../services/Notificacao';

vi.mock('../../services/Notificacao', () => ({ listarNotificacoes: vi.fn() }));

function aviso(id, titulo, tipo = 'aviso_geral') {
  return { id, titulo, mensagem: `Mensagem ${id}`, tipo, createdAt: id * 1000 };
}

async function renderizar() {
  render(<AvisosCard />);
  await act(async () => {});
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('AvisosCard', () => {
  it('mostra os 3 avisos mais recentes', async () => {
    listarNotificacoes.mockResolvedValue([
      aviso(4, 'Quarto', 'chamada_concurso'),
      aviso(3, 'Terceiro'),
      aviso(2, 'Segundo'),
      aviso(1, 'Primeiro')
    ]);
    await renderizar();

    expect(screen.getByText('Quarto')).toBeInTheDocument();
    expect(screen.getByText('Mensagem 4')).toBeInTheDocument();
    expect(screen.getByText(/Chamada de concurso/)).toBeInTheDocument();
    expect(screen.getByText('Segundo')).toBeInTheDocument();
    expect(screen.queryByText('Primeiro')).not.toBeInTheDocument();
  });

  it('avisa quando ainda não há avisos', async () => {
    listarNotificacoes.mockResolvedValue([]);
    await renderizar();

    expect(screen.getByText('Nenhum aviso por enquanto.')).toBeInTheDocument();
  });

  it('não marca os avisos como vistos (isso é papel do sino)', async () => {
    listarNotificacoes.mockResolvedValue([aviso(5, 'Novo')]);
    await renderizar();

    expect(localStorage.getItem('quintalAmora:notificacoesVistasEm')).toBeNull();
  });
});
