import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registrarCheckin, consultarStatusCheckin, consultarHistoricoCheckins } from './checkinApi';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiFetch: vi.fn()
}));

describe('services/checkinApi', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  it('registrarCheckin envia o código do QR em POST /checkin', async () => {
    await registrarCheckin('checkin:evento:3');
    expect(apiFetch).toHaveBeenCalledWith('/checkin', { method: 'POST', body: { qrCode: 'checkin:evento:3' } });
  });

  it('consultarStatusCheckin consulta o status do evento', async () => {
    await consultarStatusCheckin(3);
    expect(apiFetch).toHaveBeenCalledWith('/checkin/status/3', { method: 'GET' });
  });

  it('consultarStatusCheckin codifica o id, para um valor estranho não mudar o caminho chamado', async () => {
    await consultarStatusCheckin('3/../../admin/dashboard');
    expect(apiFetch).toHaveBeenCalledWith('/checkin/status/3%2F..%2F..%2Fadmin%2Fdashboard', { method: 'GET' });
  });

  it('consultarHistoricoCheckins busca o histórico do usuário', async () => {
    await consultarHistoricoCheckins();
    expect(apiFetch).toHaveBeenCalledWith('/checkin/historico', { method: 'GET' });
  });
});
