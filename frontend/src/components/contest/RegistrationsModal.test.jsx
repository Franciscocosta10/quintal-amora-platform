import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import RegistrationsModal from './RegistrationsModal';
import {
  cancelarInscricao,
  listarInscritosDoConcurso,
  marcarPresenca
} from '../../services/Registration';

vi.mock('../../services/Registration', () => ({
  listarInscritosDoConcurso: vi.fn(),
  marcarPresenca: vi.fn(),
  cancelarInscricao: vi.fn()
}));

const CONCURSO = { id: 4, nome: 'Concurso Cosplay', limiteParticipantes: 20 };
const INSCRITO_EM = new Date('2026-11-10T14:30:00-03:00').getTime();

const INSCRICOES = [
  { id: 1, status: 'inscrito', presencaConfirmada: false, createdAt: INSCRITO_EM, usuario: { id: 7, nomeCompleto: 'Ana Lima', email: 'ana@email.com' } },
  { id: 2, status: 'cancelado', presencaConfirmada: false, createdAt: INSCRITO_EM, usuario: { id: 8, nomeCompleto: 'Cancelada', email: 'c@email.com' } },
  { id: 3, status: 'inscrito', presencaConfirmada: true, createdAt: INSCRITO_EM, usuario: { id: 9, nomeCompleto: 'Bruno Reis', email: 'bruno@email.com' } }
];

async function renderizar(onFechar = vi.fn()) {
  render(<RegistrationsModal concurso={CONCURSO} onFechar={onFechar} />);
  await act(async () => {});
  return onFechar;
}

function linha(nome) {
  return within(screen.getByText(nome).closest('li'));
}

beforeEach(() => {
  vi.clearAllMocks();
  listarInscritosDoConcurso.mockResolvedValue(INSCRICOES);
});

describe('RegistrationsModal', () => {
  it('não renderiza nada sem concurso', () => {
    const { container } = render(<RegistrationsModal concurso={null} onFechar={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lista os inscritos na ordem, sem os cancelados, com o resumo de presença', async () => {
    await renderizar();

    expect(listarInscritosDoConcurso).toHaveBeenCalledWith(4);
    expect(screen.getByText('Concurso Cosplay')).toBeInTheDocument();
    expect(screen.getByText('2 inscrito(s) de 20 vagas · 1 presente(s)')).toBeInTheDocument();
    expect(screen.queryByText('Cancelada')).not.toBeInTheDocument();
    expect(linha('Ana Lima').getByText('1')).toBeInTheDocument();
    expect(linha('Ana Lima').getByText(/ana@email.com · inscrito em 10\/11, 14:30/)).toBeInTheDocument();
    expect(linha('Bruno Reis').getByRole('checkbox', { name: 'Presente' })).toBeChecked();
  });

  it('marca a presença de um inscrito', async () => {
    marcarPresenca.mockResolvedValue({ id: 1, presencaConfirmada: true });
    await renderizar();

    await act(async () => fireEvent.click(linha('Ana Lima').getByRole('checkbox', { name: 'Presente' })));

    expect(marcarPresenca).toHaveBeenCalledWith(1, true);
    expect(linha('Ana Lima').getByRole('checkbox', { name: 'Presente' })).toBeChecked();
    expect(screen.getByText(/2 presente\(s\)/)).toBeInTheDocument();
  });

  it('remove um inscrito e avisa a tela ao fechar', async () => {
    cancelarInscricao.mockResolvedValue({});
    const onFechar = await renderizar();

    await act(async () => fireEvent.click(linha('Ana Lima').getByRole('button', { name: 'Remover' })));

    expect(cancelarInscricao).toHaveBeenCalledWith(1);
    expect(screen.queryByText('Ana Lima')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onFechar).toHaveBeenCalledWith(true);
  });

  it('fecha sem mudanças pelo Esc e pelo fundo', async () => {
    const onFechar = await renderizar();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onFechar).toHaveBeenLastCalledWith(false);

    fireEvent.click(screen.getByRole('dialog').parentElement);
    expect(onFechar).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('dialog'));
    expect(onFechar).toHaveBeenCalledTimes(2);
  });

  it('mostra o vazio', async () => {
    listarInscritosDoConcurso.mockResolvedValue([]);
    await renderizar();

    expect(screen.getByText('Ninguém se inscreveu neste concurso ainda.')).toBeInTheDocument();
  });

  it('mostra os erros de carregar e de alterar', async () => {
    listarInscritosDoConcurso.mockRejectedValueOnce(new Error('Sem permissão.'));
    const { unmount } = render(<RegistrationsModal concurso={CONCURSO} onFechar={vi.fn()} />);
    await act(async () => {});
    expect(screen.getByRole('alert')).toHaveTextContent('Sem permissão.');
    unmount();

    marcarPresenca.mockRejectedValue(new Error('Esta inscrição foi cancelada.'));
    await renderizar();
    await act(async () => fireEvent.click(linha('Ana Lima').getByRole('checkbox', { name: 'Presente' })));
    expect(screen.getByRole('alert')).toHaveTextContent('Esta inscrição foi cancelada.');
  });
});
