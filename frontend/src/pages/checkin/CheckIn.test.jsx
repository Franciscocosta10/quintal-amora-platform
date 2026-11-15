import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import CheckIn from './CheckIn';
import { registrarCheckin, consultarStatusCheckin, consultarHistoricoCheckins } from '../../services/checkinApi';

vi.mock('../../services/checkinApi', () => ({
  registrarCheckin: vi.fn(),
  consultarStatusCheckin: vi.fn(),
  consultarHistoricoCheckins: vi.fn()
}));

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <main>{children}</main>
}));

// A câmera não existe no jsdom: o scanner falso só expõe os callbacks.
vi.mock('../../components/checkin/QrScanner', () => ({
  default: ({ onScan, onError }) => (
    <div>
      <button onClick={() => onScan('QR-123')}>Simular leitura</button>
      <button onClick={() => onError(new Error('sem câmera'))}>Simular erro de câmera</button>
    </div>
  )
}));

// 12/11/2026 14:30 no horário local.
const ENTRADA = new Date(2026, 10, 12, 14, 30).getTime();

async function renderizar() {
  render(<CheckIn />);
  await act(async () => {});
}

function clicar(nome) {
  fireEvent.click(screen.getByRole('button', { name: nome }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CheckIn', () => {
  describe('card de status', () => {
    it('mostra o evento e o convite para escanear quando ainda não fez check-in', async () => {
      consultarStatusCheckin.mockResolvedValue({ fezCheckin: false, checkin: null });
      await renderizar();

      expect(screen.getByText('Quintal da Amora')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Você ainda não fez check-in' })).toBeInTheDocument();
      expect(consultarStatusCheckin).toHaveBeenCalledWith(1);
    });

    it('mostra a confirmação com horário e local depois do check-in', async () => {
      consultarStatusCheckin.mockResolvedValue({
        fezCheckin: true,
        checkin: { dataHoraEntrada: ENTRADA, pontoDeEntrada: 'Entrada Principal' }
      });
      await renderizar();

      expect(screen.getByRole('heading', { name: 'Check-in confirmado!' })).toBeInTheDocument();
      expect(screen.getByText('Entrada às 14:30')).toBeInTheDocument();
      expect(screen.getByText('Entrada Principal')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Escanear QR Code' })).not.toBeInTheDocument();
    });

    it('não mostra horário nem local quando o check-in não os tem', async () => {
      consultarStatusCheckin.mockResolvedValue({ fezCheckin: true, checkin: null });
      await renderizar();

      expect(screen.getByRole('heading', { name: 'Check-in confirmado!' })).toBeInTheDocument();
      expect(screen.queryByText(/Entrada às/)).not.toBeInTheDocument();
    });

    it('avisa quando não consegue carregar o status', async () => {
      consultarStatusCheckin.mockRejectedValue(new Error('x'));
      await renderizar();

      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar seu status de check-in.');
    });
  });

  describe('leitura do QR Code', () => {
    beforeEach(() => {
      consultarStatusCheckin.mockResolvedValue({ fezCheckin: false, checkin: null });
    });

    it('registra o check-in e recarrega o status', async () => {
      registrarCheckin.mockResolvedValue({});
      await renderizar();

      clicar('Escanear QR Code');
      consultarStatusCheckin.mockResolvedValue({ fezCheckin: true, checkin: { dataHoraEntrada: ENTRADA } });
      await act(async () => clicar('Simular leitura'));

      expect(registrarCheckin).toHaveBeenCalledWith('QR-123');
      expect(screen.getByRole('heading', { name: 'Check-in confirmado!' })).toBeInTheDocument();
    });

    it('avisa quando o check-in passa mas o status não recarrega', async () => {
      registrarCheckin.mockResolvedValue({});
      await renderizar();

      clicar('Escanear QR Code');
      consultarStatusCheckin.mockRejectedValue(new Error('x'));
      await act(async () => clicar('Simular leitura'));

      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar seu status de check-in.');
    });

    it('ignora a resposta do status se a tela já foi fechada', async () => {
      let resolver;
      let rejeitar;
      consultarStatusCheckin.mockReturnValueOnce(new Promise((resolve) => { resolver = resolve; }));
      render(<CheckIn />).unmount();
      await act(async () => resolver({ fezCheckin: true }));

      consultarStatusCheckin.mockReturnValueOnce(new Promise((_, reject) => { rejeitar = reject; }));
      render(<CheckIn />).unmount();
      await act(async () => rejeitar(new Error('x')));
    });

    it('avisa quando o QR Code é inválido', async () => {
      registrarCheckin.mockRejectedValue(new Error('x'));
      await renderizar();

      clicar('Escanear QR Code');
      await act(async () => clicar('Simular leitura'));

      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível validar esse QR Code.');
    });

    it('avisa quando não há acesso à câmera', async () => {
      await renderizar();

      clicar('Escanear QR Code');
      clicar('Simular erro de câmera');

      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível acessar a câmera.');
    });

    it('cancela a leitura e volta ao convite', async () => {
      await renderizar();

      clicar('Escanear QR Code');
      clicar('Cancelar');

      expect(screen.getByRole('button', { name: 'Escanear QR Code' })).toBeInTheDocument();
    });
  });

  it('mostra os 4 passos do "Como funciona"', async () => {
    consultarStatusCheckin.mockResolvedValue({ fezCheckin: false, checkin: null });
    await renderizar();

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('Escaneie o QR Code')).toBeInTheDocument();
  });

  describe('histórico', () => {
    beforeEach(() => {
      consultarStatusCheckin.mockResolvedValue({ fezCheckin: false, checkin: null });
    });

    it('mostra a linha do tempo com data, evento, horário e local', async () => {
      consultarHistoricoCheckins.mockResolvedValue({
        checkins: [
          { id: 1, dataHoraEntrada: ENTRADA, evento: { nome: 'Quintal da Amora - 15ª Edição' }, pontoDeEntrada: 'Palco 2' },
          { id: 2, dataHoraEntrada: ENTRADA, evento: 7 }
        ]
      });
      await renderizar();

      await act(async () => fireEvent.click(screen.getByRole('tab', { name: 'Histórico' })));

      expect(screen.getByText('Quintal da Amora - 15ª Edição')).toBeInTheDocument();
      expect(screen.getByText('Evento #7')).toBeInTheDocument();
      expect(screen.getByText('Palco 2')).toBeInTheDocument();
      expect(screen.getAllByText('14:30')).toHaveLength(2);
      expect(screen.getAllByText(/12 de novembro de 2026/)).toHaveLength(2);
    });

    it('mostra o vazio e o erro do histórico', async () => {
      consultarHistoricoCheckins.mockResolvedValueOnce({});
      await renderizar();

      await act(async () => fireEvent.click(screen.getByRole('tab', { name: 'Histórico' })));
      expect(screen.getByText('Você ainda não realizou nenhum check-in.')).toBeInTheDocument();

      consultarHistoricoCheckins.mockRejectedValueOnce(new Error('x'));
      await act(async () => fireEvent.click(screen.getByRole('tab', { name: 'Histórico' })));
      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar seu histórico de check-ins.');

      fireEvent.click(screen.getByRole('tab', { name: 'Meu check-in' }));
      expect(screen.getByText('Como funciona?')).toBeInTheDocument();
    });
  });
});
