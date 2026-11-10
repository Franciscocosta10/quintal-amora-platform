import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Catalog from './Catalog';
import { useAuth } from '../../hooks/useAuth';
import { useExpositores } from '../../hooks/useExpositores';
import { criarExpositor, editarExpositor, removerExpositor } from '../../services/Expositor';
import { buscarEventoAtual } from '../../services/event';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../hooks/useExpositores', () => ({ useExpositores: vi.fn() }));
vi.mock('../../services/Expositor', () => ({
  criarExpositor: vi.fn(),
  editarExpositor: vi.fn(),
  removerExpositor: vi.fn()
}));
vi.mock('../../services/event', () => ({ buscarEventoAtual: vi.fn() }));

// O Layout depende de rotas e de autenticação, que não são o foco aqui.
vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <main>{children}</main>
}));

// O formulário tem testes próprios; aqui só importa o que a página faz com
// o resultado dele.
vi.mock('../../components/catalog/ExpositorForm', () => ({
  default: ({ expositorInicial, eventoId, onSalvar, onExcluir, onCancelar }) => (
    <div role="dialog" aria-label="Formulário">
      <span>editando: {expositorInicial?.nome ?? 'nenhum'}</span>
      <span>evento: {eventoId ?? 'nenhum'}</span>
      <button onClick={() => onSalvar({ nome: 'Salvo' })}>Salvar</button>
      <button onClick={() => onExcluir(expositorInicial?.id)}>Excluir</button>
      <button onClick={onCancelar}>Fechar formulário</button>
    </div>
  )
}));

const LOJA = { id: 1, nome: 'Loja Geek', tipo: 'loja' };
const ARTISTA = { id: 2, nome: 'Ateliê Sakura', tipo: 'artista' };

const recarregar = vi.fn();

async function renderizar({ isAdmin = false, expositores = [LOJA, ARTISTA], carregando = false, erro = null } = {}) {
  useAuth.mockReturnValue({ isAdmin });
  useExpositores.mockReturnValue({ expositores, carregando, erro, recarregar });

  const utilitarios = render(<Catalog />);
  await act(async () => {});
  return utilitarios;
}

function clicar(nome) {
  fireEvent.click(screen.getByRole('button', { name: nome }));
}

function nomesNoGrid() {
  return [...document.querySelectorAll('.expositor-card__nome')].map((el) => el.textContent);
}

beforeEach(() => {
  vi.clearAllMocks();
  buscarEventoAtual.mockResolvedValue({ id: 9 });
  recarregar.mockResolvedValue();
});

describe('Catalog', () => {
  describe('visitante (RF13/RF14)', () => {
    it('lista todos os expositores e não mostra ações de admin', async () => {
      await renderizar();

      expect(nomesNoGrid()).toEqual(['Loja Geek', 'Ateliê Sakura']);
      expect(screen.queryByRole('button', { name: '+ Adicionar expositor' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    });

    it('filtra pelas abas Lojas / Artistas e volta para Todos', async () => {
      await renderizar();

      clicar('Artistas');
      expect(nomesNoGrid()).toEqual(['Ateliê Sakura']);

      clicar('Lojas');
      expect(nomesNoGrid()).toEqual(['Loja Geek']);

      clicar('Todos');
      expect(nomesNoGrid()).toHaveLength(2);
    });

    it('busca por nome sem diferenciar acentos e maiúsculas', async () => {
      await renderizar();

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ATELIE' } });

      expect(nomesNoGrid()).toEqual(['Ateliê Sakura']);
    });

    it('diferencia "nada encontrado no filtro" de "catálogo vazio"', async () => {
      const { unmount } = await renderizar();
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
      expect(screen.getByText('Nenhum expositor encontrado para este filtro.')).toBeInTheDocument();
      unmount();

      await renderizar({ expositores: [] });
      expect(screen.getByText('Nenhum expositor cadastrado ainda.')).toBeInTheDocument();
    });

    it('repassa os estados de carregando e erro para o grid', async () => {
      const { unmount } = await renderizar({ carregando: true });
      expect(screen.getByText('Carregando expositores…')).toBeInTheDocument();
      unmount();

      await renderizar({ erro: new Error('x') });
      expect(screen.getByText('Não foi possível carregar o catálogo. Tente novamente.')).toBeInTheDocument();
    });

    it('abre e fecha o detalhe do expositor', async () => {
      await renderizar();

      clicar('Ver detalhes de Loja Geek');
      expect(screen.getByRole('dialog', { name: 'Loja Geek' })).toBeInTheDocument();

      clicar('Fechar');
      expect(screen.queryByRole('dialog', { name: 'Loja Geek' })).not.toBeInTheDocument();
    });

    it('não mostra o erro do evento atual para visitante', async () => {
      buscarEventoAtual.mockRejectedValue(new Error('Sem evento.'));
      await renderizar();

      expect(screen.queryByText('Sem evento.')).not.toBeInTheDocument();
    });
  });

  describe('administrador (RF15)', () => {
    it('cadastra um expositor no evento atual, recarrega a lista e avisa', async () => {
      criarExpositor.mockResolvedValue({ id: 3 });
      await renderizar({ isAdmin: true });

      clicar('+ Adicionar expositor');
      expect(screen.getByText('editando: nenhum')).toBeInTheDocument();
      expect(screen.getByText('evento: 9')).toBeInTheDocument();

      await act(async () => clicar('Salvar'));

      expect(criarExpositor).toHaveBeenCalledWith({ nome: 'Salvo' });
      expect(recarregar).toHaveBeenCalled();
      expect(screen.getByRole('status')).toHaveTextContent('Expositor adicionado ao catálogo!');
      expect(screen.queryByRole('dialog', { name: 'Formulário' })).not.toBeInTheDocument();
    });

    it('edita pelo botão do card', async () => {
      editarExpositor.mockResolvedValue({});
      await renderizar({ isAdmin: true });

      fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
      expect(screen.getByText('editando: Loja Geek')).toBeInTheDocument();

      await act(async () => clicar('Salvar'));

      expect(editarExpositor).toHaveBeenCalledWith(1, { nome: 'Salvo' });
      expect(screen.getByRole('status')).toHaveTextContent('Expositor atualizado com sucesso!');
    });

    it('edita a partir do detalhe, fechando o detalhe', async () => {
      await renderizar({ isAdmin: true });

      clicar('Ver detalhes de Ateliê Sakura');
      clicar('Editar expositor');

      expect(screen.queryByRole('dialog', { name: 'Ateliê Sakura' })).not.toBeInTheDocument();
      expect(screen.getByText('editando: Ateliê Sakura')).toBeInTheDocument();
    });

    it('exclui, recarrega a lista e avisa', async () => {
      removerExpositor.mockResolvedValue({ id: 1 });
      await renderizar({ isAdmin: true });

      fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
      await act(async () => clicar('Excluir'));

      expect(removerExpositor).toHaveBeenCalledWith(1);
      expect(recarregar).toHaveBeenCalled();
      expect(screen.getByRole('status')).toHaveTextContent('Expositor excluído do catálogo.');
    });

    it('limpa o aviso ao abrir o formulário de novo e fecha pelo cancelar', async () => {
      criarExpositor.mockResolvedValue({ id: 3 });
      await renderizar({ isAdmin: true });

      clicar('+ Adicionar expositor');
      await act(async () => clicar('Salvar'));
      expect(screen.getByRole('status')).toBeInTheDocument();

      clicar('+ Adicionar expositor');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      clicar('Fechar formulário');
      expect(screen.queryByRole('dialog', { name: 'Formulário' })).not.toBeInTheDocument();
    });

    it('mostra o erro do evento atual (ou a mensagem padrão) para o admin', async () => {
      buscarEventoAtual.mockRejectedValue(new Error('Sem evento.'));
      const { unmount } = await renderizar({ isAdmin: true });
      expect(screen.getByText('Sem evento.')).toBeInTheDocument();
      unmount();

      buscarEventoAtual.mockRejectedValue(new Error(''));
      await renderizar({ isAdmin: true });
      expect(screen.getByText('Não foi possível identificar o evento atual.')).toBeInTheDocument();
    });
  });

  it('ignora a resposta do evento atual se a página já foi desmontada', async () => {
    useAuth.mockReturnValue({ isAdmin: true });
    useExpositores.mockReturnValue({ expositores: [], carregando: false, erro: null, recarregar });

    let resolver;
    buscarEventoAtual.mockReturnValueOnce(new Promise((resolve) => { resolver = resolve; }));
    const primeiro = render(<Catalog />);
    primeiro.unmount();
    await act(async () => resolver({ id: 1 }));

    let rejeitar;
    buscarEventoAtual.mockReturnValueOnce(new Promise((_, reject) => { rejeitar = reject; }));
    const segundo = render(<Catalog />);
    segundo.unmount();
    await act(async () => rejeitar(new Error('x')));
  });
});
