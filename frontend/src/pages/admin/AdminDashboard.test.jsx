import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { buscarPainelAdmin } from '../../services/Admin';

vi.mock('../../services/Admin', () => ({ buscarPainelAdmin: vi.fn() }));

// O Layout depende de rotas e de autenticação, que não são o foco aqui.
vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <main>{children}</main>
}));

const PAINEL = {
  evento: {
    id: 1,
    nome: 'Quintal da Amora',
    edicao: 15,
    dataHoraInicio: new Date(2026, 9, 10, 9).getTime(),
    dataHoraFim: new Date(2026, 9, 11, 18).getTime()
  },
  totais: {
    participantes: 1248,
    checkins: 872,
    atividades: 10,
    concursosAbertos: 4,
    inscricoes: 55,
    expositores: 18
  },
  proximasAtividades: [
    { id: 1, titulo: 'Abertura do Evento', local: 'Palco 1', dataHoraInicio: new Date(2026, 9, 10, 9).getTime(), status: 'confirmada' },
    { id: 2, titulo: 'Concurso Cosplay', local: null, dataHoraInicio: new Date(2026, 9, 10, 10, 30).getTime(), status: 'atrasada' }
  ],
  usuariosRecentes: [
    { id: 1, nomeCompleto: 'Ana Beatriz', email: 'ana@email.com', perfil: 'visitante', ativo: true, createdAt: new Date(2026, 4, 10).getTime() },
    { id: 2, nomeCompleto: 'Luiza Helena', email: 'luiza@email.com', perfil: 'administrador', ativo: false, createdAt: new Date(2026, 4, 11).getTime() }
  ]
};

async function renderizar() {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  await act(async () => {});
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminDashboard', () => {
  it('mostra o resumo do evento atual', async () => {
    buscarPainelAdmin.mockResolvedValue(PAINEL);
    await renderizar();

    expect(screen.getByText(/Resumo de Quintal da Amora \(10\/10\/2026 a 11\/10\/2026\)/)).toBeInTheDocument();
  });

  it('mostra os totais em cartões, com link para a tela de cada dado', async () => {
    buscarPainelAdmin.mockResolvedValue(PAINEL);
    await renderizar();

    expect(screen.getByText('1.248')).toBeInTheDocument();
    expect(screen.getByText('Participantes cadastrados')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /872\s*Check-ins realizados/ })).toHaveAttribute('href', '/checkin');
    expect(screen.getByRole('link', { name: /18\s*Lojas e artistas/ })).toHaveAttribute('href', '/catalogo');
  });

  it('lista as próximas atividades e destaca as atrasadas', async () => {
    buscarPainelAdmin.mockResolvedValue(PAINEL);
    await renderizar();

    expect(screen.getByText('Abertura do Evento')).toBeInTheDocument();
    expect(screen.getByText('Palco 1')).toBeInTheDocument();
    expect(screen.getByText('Atrasada')).toBeInTheDocument();
  });

  it('lista os usuários recentes com perfil ou status inativo', async () => {
    buscarPainelAdmin.mockResolvedValue(PAINEL);
    await renderizar();

    expect(screen.getByText('Ana Beatriz')).toBeInTheDocument();
    expect(screen.getByText('Participante')).toBeInTheDocument();
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('avisa quando ainda não há evento cadastrado', async () => {
    buscarPainelAdmin.mockResolvedValue({
      ...PAINEL,
      evento: null,
      proximasAtividades: [],
      usuariosRecentes: []
    });
    await renderizar();

    expect(screen.getByText(/Nenhum evento cadastrado ainda/)).toBeInTheDocument();
    expect(screen.getByText('Nenhuma atividade futura na programação.')).toBeInTheDocument();
    expect(screen.getByText('Nenhum usuário cadastrado.')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro da API', async () => {
    buscarPainelAdmin.mockRejectedValue(new Error('Acesso permitido somente para administradores.'));
    await renderizar();

    expect(screen.getByRole('alert')).toHaveTextContent('Acesso permitido somente para administradores.');
  });

  it('recarrega os dados ao clicar em Atualizar', async () => {
    buscarPainelAdmin.mockResolvedValue(PAINEL);
    await renderizar();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Atualizar' }));
    });

    expect(buscarPainelAdmin).toHaveBeenCalledTimes(2);
  });
});
