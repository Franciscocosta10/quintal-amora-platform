import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import EventForm from './EventForm';
import { salvarEvento } from '../../services/event';

vi.mock('../../services/event', () => ({ salvarEvento: vi.fn() }));

const EVENTO = {
  id: 3,
  nome: 'Quintal da Amora',
  edicao: 15,
  localizacao: 'Joinville',
  dataHoraInicio: new Date('2026-11-21T10:00:00-03:00').getTime(),
  dataHoraFim: new Date('2026-11-22T19:00:00-03:00').getTime()
};

function alterar(rotulo, valor) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

async function salvar() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar evento|Salvar alterações/ }));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EventForm', () => {
  it('cadastra o evento quando ainda não existe nenhum', async () => {
    const onSalvo = vi.fn();
    salvarEvento.mockResolvedValue({ id: 1, nome: 'Quintal da Amora' });
    render(<EventForm evento={null} onSalvo={onSalvo} />);

    alterar('Nome do evento', '  Quintal da Amora ');
    alterar('Início', '2026-11-21T10:00');
    alterar('Término', '2026-11-21T20:00');
    await salvar();

    expect(salvarEvento).toHaveBeenCalledWith({
      nome: 'Quintal da Amora',
      edicao: null,
      localizacao: null,
      dataHoraInicio: new Date('2026-11-21T10:00:00-03:00').getTime(),
      dataHoraFim: new Date('2026-11-21T20:00:00-03:00').getTime()
    });
    expect(onSalvo).toHaveBeenCalledWith({ id: 1, nome: 'Quintal da Amora' });
    expect(screen.getByRole('status')).toHaveTextContent('Dados do evento salvos!');
  });

  it('abre preenchido com o evento atual e salva a edição', async () => {
    salvarEvento.mockResolvedValue(EVENTO);
    render(<EventForm evento={EVENTO} />);

    expect(screen.getByLabelText('Nome do evento')).toHaveValue('Quintal da Amora');
    expect(screen.getByLabelText('Início')).toHaveValue('2026-11-21T10:00');

    alterar('Local', 'Expoville');
    await salvar();

    expect(salvarEvento.mock.calls[0][0]).toMatchObject({ edicao: 15, localizacao: 'Expoville' });
  });

  it('não envia quando faltam campos obrigatórios', async () => {
    render(<EventForm evento={null} />);
    await salvar();

    expect(screen.getByRole('alert')).toHaveTextContent('Preencha o nome, o início e o término do evento.');
    expect(salvarEvento).not.toHaveBeenCalled();
  });

  it('não envia quando o término é antes do início', async () => {
    render(<EventForm evento={EVENTO} />);
    alterar('Término', '2026-11-20T10:00');
    await salvar();

    expect(screen.getByRole('alert')).toHaveTextContent('O término do evento deve ser depois do início.');
    expect(salvarEvento).not.toHaveBeenCalled();
  });

  it('mostra o erro do servidor', async () => {
    salvarEvento.mockRejectedValue(new Error('Sem permissão.'));
    render(<EventForm evento={EVENTO} />);
    await salvar();

    expect(screen.getByRole('alert')).toHaveTextContent('Sem permissão.');
  });
});
