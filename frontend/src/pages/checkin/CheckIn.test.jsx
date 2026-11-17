import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckIn from './CheckIn';
import { registrarCheckin, consultarStatusCheckin, consultarHistoricoCheckins } from '../../services/checkinApi';
import { buscarEventoAtual } from '../../services/event';

vi.mock('../../services/checkinApi', () => ({
  registrarCheckin: vi.fn(),
  consultarStatusCheckin: vi.fn(),
  consultarHistoricoCheckins: vi.fn()
}));

vi.mock('../../services/event', () => ({
  buscarEventoAtual: vi.fn()
}));

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <main>{children}</main>
}));

// A câmera não existe no jsdom: o scanner falso só expõe os callbacks.
vi.mock('../../components/checkin/QrScanner', () => ({
  default: ({ onScan, onError }) => (
    <div>
      <button onClick={() => onScan('QR-123')}>Simular leitura</button>
      <button onClick={() => onScan(LINK_DO_TOTEM)}>Simular leitura do link</button>
      <button onClick={() => onError(new Error('sem câmera'))}>Simular erro de câmera</button>
    </div>
  )
}));

const CODIGO_DO_TOTEM = 'checkin:evento:3:ponto:Entrada Principal';
const LINK_DO_TOTEM = `https://quintaldaamora.com.br/checkin?qr=${encodeURIComponent(CODIGO_DO_TOTEM)}`;

// 12/11/2026 14:30 no horário local.
const ENTRADA = new Date(2026, 10, 12, 14, 30).getTime();

// A tela lê o ?qr= do endereço, então precisa de um roteador.
function montar(rota = '/checkin') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <CheckIn />
    </MemoryRouter>
  );
}

async function renderizar(rota) {
  montar(rota);
  await act(async () => {});
}

function clicar(nome) {
  fireEvent.click(screen.getByRole('button', { name: nome }));
}

beforeEach(() => {
  vi.clearAllMocks();
  buscarEventoAtual.mockResolvedValue({ id: 3, nome: 'Quintal da Amora 15ª Edição' });
});

describe('CheckIn', () => {
  describe('card de status', () => {
    it('mostra o evento e o convite para escanear quando ainda não fez check-in', async () => {
      consultarStatusCheckin.mockResolvedValue({ fezCheckin: false, checkin: null });
      await renderizar();

      expect(screen.getByText('Quintal da Amora 15ª Edição')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Você ainda não fez check-in' })).toBeInTheDocument();
      expect(consultarStatusCheckin).toHaveBeenCalledWith(3);
    });

    it('avisa que não há evento e esconde o scanner quando nenhum evento foi cadastrado', async () => {
      buscarEventoAtual.mockResolvedValue(null);
      await renderizar();

      expect(screen.getByText(/Nenhum evento cadastrado ainda/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Escanear QR Code/ })).not.toBeInTheDocument();
      expect(consultarStatusCheckin).not.toHaveBeenCalled();
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

    it('ignora as respostas se a tela já foi fechada', async () => {
      // Evento chega depois de fechar: nem consulta o status.
      let resolverEvento;
      buscarEventoAtual.mockReturnValueOnce(new Promise((resolve) => { resolverEvento = resolve; }));
      montar().unmount();
      await act(async () => resolverEvento({ id: 3 }));
      expect(consultarStatusCheckin).not.toHaveBeenCalled();

      // Status chega depois de fechar.
      let resolverStatus;
      consultarStatusCheckin.mockReturnValueOnce(new Promise((resolve) => { resolverStatus = resolve; }));
      const tela = montar();
      await act(async () => {});
      tela.unmount();
      await act(async () => resolverStatus({ fezCheckin: true }));

      // Erro chega depois de fechar.
      let rejeitar;
      buscarEventoAtual.mockReturnValueOnce(new Promise((_, reject) => { rejeitar = reject; }));
      montar().unmount();
      await act(async () => rejeitar(new Error('x')));
    });

    it('tira o código do link quando o QR do totem é lido pelo botão do app', async () => {
      registrarCheckin.mockResolvedValue({});
      await renderizar();

      clicar('Escanear QR Code');
      await act(async () => clicar('Simular leitura do link'));

      expect(registrarCheckin).toHaveBeenCalledWith(CODIGO_DO_TOTEM);
    });

    it('avisa quando o QR Code é inválido', async () => {
      registrarCheckin.mockRejectedValue(new Error('x'));
      await renderizar();

      clicar('Escanear QR Code');
      await act(async () => clicar('Simular leitura'));

      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível validar esse QR Code.');
    });

    it.each([
      [true, 'Verifique se o navegador tem permissão para usá-la.'],
      [false, 'o navegador só libera a câmera em sites com https.']
    ])('avisa quando não há acesso à câmera (conexão segura: %s)', async (seguro, mensagem) => {
      vi.stubGlobal('isSecureContext', seguro);
      await renderizar();

      clicar('Escanear QR Code');
      clicar('Simular erro de câmera');

      expect(screen.getByRole('alert')).toHaveTextContent(mensagem);
      vi.unstubAllGlobals();
    });

    it('cancela a leitura e volta ao convite', async () => {
      await renderizar();

      clicar('Escanear QR Code');
      clicar('Cancelar');

      expect(screen.getByRole('button', { name: 'Escanear QR Code' })).toBeInTheDocument();
    });
  });

  describe('link do QR do totem (aberto pela câmera do celular)', () => {
    const ROTA_DO_LINK = `/checkin?qr=${encodeURIComponent(CODIGO_DO_TOTEM)}`;

    it('faz o check-in sozinho e mostra a confirmação', async () => {
      registrarCheckin.mockResolvedValue({});
      consultarStatusCheckin.mockResolvedValue({
        fezCheckin: true,
        checkin: { dataHoraEntrada: ENTRADA, pontoDeEntrada: 'Entrada Principal' }
      });
      await renderizar(ROTA_DO_LINK);

      expect(registrarCheckin).toHaveBeenCalledWith(CODIGO_DO_TOTEM);
      expect(screen.getByRole('heading', { name: 'Check-in confirmado!' })).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('só mostra a confirmação quando o link é aberto de novo', async () => {
      registrarCheckin.mockRejectedValue(new Error('Você já realizou o check-in neste evento.'));
      consultarStatusCheckin.mockResolvedValue({ fezCheckin: true, checkin: null });
      await renderizar(ROTA_DO_LINK);

      expect(screen.getByRole('heading', { name: 'Check-in confirmado!' })).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('avisa quando o código do link é inválido', async () => {
      registrarCheckin.mockRejectedValue(new Error('QR Code inválido para check-in.'));
      consultarStatusCheckin.mockResolvedValue({ fezCheckin: false, checkin: null });
      await renderizar('/checkin?qr=qualquer-coisa');

      expect(registrarCheckin).toHaveBeenCalledWith('qualquer-coisa');
      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível validar esse QR Code.');
      expect(screen.getByRole('button', { name: 'Escanear QR Code' })).toBeInTheDocument();
    });

    it('não tenta o check-in quando não há evento cadastrado', async () => {
      buscarEventoAtual.mockResolvedValue(null);
      await renderizar(ROTA_DO_LINK);

      expect(registrarCheckin).not.toHaveBeenCalled();
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
