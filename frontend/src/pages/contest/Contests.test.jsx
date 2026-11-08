import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Contests from './Contests';
import { useAuth } from '../../hooks/useAuth';
import { useContests } from '../../hooks/useContests';
import { useMyRegistrations } from '../../hooks/useMyRegistrations';
import { criarConcurso, editarConcurso, removerConcurso } from '../../services/Contest';
import { inscreverEmConcurso, cancelarInscricao } from '../../services/Registration';
import { buscarEventoAtual } from '../../services/event';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../hooks/useContests', () => ({ useContests: vi.fn() }));
vi.mock('../../hooks/useMyRegistrations', () => ({ useMyRegistrations: vi.fn() }));
vi.mock('../../services/Contest', () => ({
  criarConcurso: vi.fn(),
  editarConcurso: vi.fn(),
  removerConcurso: vi.fn()
}));
vi.mock('../../services/Registration', () => ({
  inscreverEmConcurso: vi.fn(),
  cancelarInscricao: vi.fn()
}));
vi.mock('../../services/event', () => ({ buscarEventoAtual: vi.fn() }));

// O Layout depende de rotas e de autenticação, que não são o foco aqui.
vi.mock('../../components/Layout', () => ({
  default: ({ children, rightRail }) => (
    <div>
      <main>{children}</main>
      <aside>{rightRail}</aside>
    </div>
  )
}));

// O formulário tem testes próprios; aqui só importa o que a página faz com
// o resultado dele.
vi.mock('../../components/contest/ContestForm', () => ({
  default: ({ concursoInicial, eventoId, onSalvar, onExcluir, onCancelar }) => (
    <div role="dialog" aria-label="Formulário">
      <span>editando: {concursoInicial?.nome ?? 'nenhum'}</span>
      <span>evento: {eventoId ?? 'nenhum'}</span>
      <button onClick={() => onSalvar({ nome: 'Salvo' })}>Salvar</button>
      <button onClick={() => onExcluir(concursoInicial?.id)}>Excluir</button>
      <button onClick={onCancelar}>Fechar formulário</button>
    </div>
  )
}));

const COSPLAY = {
  id: 1,
  nome: 'Concurso de Cosplay',
  categoria: 'cosplay',
  status: 'aberto',
  destaque: true,
  dataHoraInicio: new Date('2099-06-20T14:00:00-03:00').getTime()
};

const QUIZ = {
  id: 2,
  nome: 'Quiz Geek',
  categoria: 'quiz',
  status: 'aberto',
  destaque: false,
  dataHoraInicio: new Date('2099-06-21T14:00:00-03:00').getTime()
};

const reload = vi.fn();
const recarregarInscricoes = vi.fn();

function configurar({
  isAdmin = false,
  concursos = [COSPLAY, QUIZ],
  carregando = false,
  erro = null,
  inscricoes = []
} = {}) {
  useAuth.mockReturnValue({ isAdmin });
  useContests.mockReturnValue({ concursos, carregando, erro });
  useMyRegistrations.mockReturnValue({ inscricoes, recarregar: recarregarInscricoes });
}

async function renderizar(opcoes) {
  configurar(opcoes);
  const utilitarios = render(<Contests />);
  await act(async () => {});
  return utilitarios;
}

function clicar(nome) {
  fireEvent.click(screen.getByRole('button', { name: nome }));
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.stubGlobal('location', { ...window.location, reload });
  buscarEventoAtual.mockResolvedValue({ id: 9 });
  recarregarInscricoes.mockResolvedValue();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Contests', () => {
  describe('listagem', () => {
    it('agrupa os concursos por dia e lista os destaques', async () => {
      await renderizar();

      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
      expect(screen.getByRole('main')).toHaveTextContent('Quiz Geek');

      const destaques = within(screen.getByRole('complementary'));
      expect(destaques.getByText('Concurso de Cosplay')).toBeInTheDocument();
      expect(destaques.getByText('cosplay')).toBeInTheDocument();
      expect(destaques.queryByText('Quiz Geek')).not.toBeInTheDocument();
    });

    it('mostra destaque sem categoria', async () => {
      await renderizar({ concursos: [{ ...COSPLAY, categoria: null }] });

      const destaques = within(screen.getByRole('complementary'));
      expect(destaques.getByText('Concurso de Cosplay')).toBeInTheDocument();
      expect(destaques.queryByText('cosplay')).not.toBeInTheDocument();
    });

    it('avisa quando não há destaques', async () => {
      await renderizar({ concursos: [QUIZ] });
      expect(screen.getByText('Nenhum destaque marcado ainda.')).toBeInTheDocument();
    });

    it('repassa os estados de carregamento, erro e lista vazia', async () => {
      const carregando = await renderizar({ carregando: true });
      expect(screen.getByText('Carregando concursos…')).toBeInTheDocument();
      carregando.unmount();

      const comErro = await renderizar({ erro: new Error('falhou') });
      expect(screen.getByText(/Não foi possível carregar os concursos/)).toBeInTheDocument();
      comErro.unmount();

      await renderizar({ concursos: [] });
      expect(screen.getByText(/Nenhum concurso cadastrado/)).toBeInTheDocument();
    });
  });

  describe('filtros', () => {
    it('filtra por categoria e volta para Todos', async () => {
      await renderizar();
      const principal = within(screen.getByRole('main'));

      clicar('Quiz');
      expect(principal.getByText('Quiz Geek')).toBeInTheDocument();
      expect(principal.queryByText('Concurso de Cosplay')).not.toBeInTheDocument();

      clicar('Todos');
      expect(principal.getByText('Concurso de Cosplay')).toBeInTheDocument();
    });

    it('mostra lista vazia quando a categoria selecionada deixa de existir', async () => {
      const { rerender } = await renderizar();
      clicar('Quiz');

      useContests.mockReturnValue({ concursos: [COSPLAY], carregando: false, erro: null });
      rerender(<Contests />);

      expect(screen.getByText(/Nenhum concurso cadastrado/)).toBeInTheDocument();
    });

    it('filtra pelos favoritos do visitante e sai do filtro ao escolher uma categoria', async () => {
      await renderizar();
      const principal = within(screen.getByRole('main'));

      expect(screen.queryByRole('button', { name: '★ Favoritos' })).not.toBeInTheDocument();

      const estrelas = screen.getAllByRole('button', { name: 'Adicionar aos favoritos' });
      fireEvent.click(estrelas[1]);

      clicar('★ Favoritos');
      expect(principal.getByText('Quiz Geek')).toBeInTheDocument();
      expect(principal.queryByText('Concurso de Cosplay')).not.toBeInTheDocument();

      clicar('Cosplay');
      expect(principal.getByText('Concurso de Cosplay')).toBeInTheDocument();
      expect(principal.queryByText('Quiz Geek')).not.toBeInTheDocument();
    });
  });

  describe('inscrição', () => {
    it('mostra como inscrito apenas as inscrições não canceladas', async () => {
      await renderizar({
        inscricoes: [
          { id: 50, concurso: { id: 1 }, status: 'inscrito' },
          { id: 51, concurso: 2, status: 'cancelado' }
        ]
      });

      expect(screen.getAllByRole('button', { name: 'Inscrito ✓ Cancelar' })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: 'Inscrever-se' })).toHaveLength(1);
    });

    it('aceita inscrição com o concurso retornado apenas como id', async () => {
      await renderizar({ inscricoes: [{ id: 50, concurso: 2, status: 'inscrito' }] });

      clicar('Inscrito ✓ Cancelar');

      await waitFor(() => expect(cancelarInscricao).toHaveBeenCalledWith(50));
    });

    it('inscreve, recarrega as inscrições e confirma em um modal que pode ser fechado', async () => {
      inscreverEmConcurso.mockResolvedValue({});
      await renderizar({ concursos: [QUIZ] });

      clicar('Inscrever-se');

      expect(await screen.findByText('Inscrição confirmada!')).toBeInTheDocument();
      expect(inscreverEmConcurso).toHaveBeenCalledWith(2);
      expect(recarregarInscricoes).toHaveBeenCalledTimes(1);

      clicar('OK');
      expect(screen.queryByText('Inscrição confirmada!')).not.toBeInTheDocument();
    });

    it.each([
      ['com a mensagem da API', new Error('Vagas esgotadas'), 'Vagas esgotadas'],
      ['com a mensagem padrão', {}, 'Não foi possível concluir a inscrição.']
    ])('mostra o erro de inscrição %s', async (_descricao, falha, mensagem) => {
      inscreverEmConcurso.mockRejectedValue(falha);
      await renderizar({ concursos: [QUIZ] });

      clicar('Inscrever-se');

      expect(await screen.findByText(mensagem)).toBeInTheDocument();
    });

    it('cancela a inscrição e recarrega a lista', async () => {
      cancelarInscricao.mockResolvedValue({});
      await renderizar({ concursos: [QUIZ], inscricoes: [{ id: 50, concurso: 2, status: 'inscrito' }] });

      clicar('Inscrito ✓ Cancelar');

      await waitFor(() => expect(recarregarInscricoes).toHaveBeenCalledTimes(1));
      expect(cancelarInscricao).toHaveBeenCalledWith(50);
    });

    it.each([
      ['com a mensagem da API', new Error('Prazo encerrado'), 'Prazo encerrado'],
      ['com a mensagem padrão', {}, 'Não foi possível cancelar a inscrição.']
    ])('mostra o erro de cancelamento %s', async (_descricao, falha, mensagem) => {
      cancelarInscricao.mockRejectedValue(falha);
      await renderizar({ concursos: [QUIZ], inscricoes: [{ id: 50, concurso: 2, status: 'inscrito' }] });

      clicar('Inscrito ✓ Cancelar');

      expect(await screen.findByText(mensagem)).toBeInTheDocument();
    });
  });

  describe('administração', () => {
    it('não mostra as ações de admin para o visitante', async () => {
      await renderizar();
      expect(screen.queryByRole('button', { name: '+ Adicionar concurso' })).not.toBeInTheDocument();
    });

    it('cria um concurso usando o evento atual e recarrega a página', async () => {
      criarConcurso.mockResolvedValue({});
      await renderizar({ isAdmin: true });

      clicar('+ Adicionar concurso');
      expect(screen.getByText('editando: nenhum')).toBeInTheDocument();
      expect(screen.getByText('evento: 9')).toBeInTheDocument();

      clicar('Salvar');

      await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
      expect(criarConcurso).toHaveBeenCalledWith({ nome: 'Salvo' });
      expect(editarConcurso).not.toHaveBeenCalled();
    });

    it('edita o concurso selecionado e recarrega a página', async () => {
      editarConcurso.mockResolvedValue({});
      await renderizar({ isAdmin: true, concursos: [QUIZ] });

      clicar('Editar');
      expect(screen.getByText('editando: Quiz Geek')).toBeInTheDocument();

      clicar('Salvar');

      await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
      expect(editarConcurso).toHaveBeenCalledWith(2, { nome: 'Salvo' });
      expect(criarConcurso).not.toHaveBeenCalled();
    });

    it('fechar o formulário descarta o concurso em edição', async () => {
      await renderizar({ isAdmin: true, concursos: [QUIZ] });

      clicar('Editar');
      clicar('Fechar formulário');
      expect(screen.queryByRole('dialog', { name: 'Formulário' })).not.toBeInTheDocument();

      clicar('+ Adicionar concurso');
      expect(screen.getByText('editando: nenhum')).toBeInTheDocument();
    });

    it('exclui o concurso, fecha o formulário e recarrega a página', async () => {
      removerConcurso.mockResolvedValue({});
      await renderizar({ isAdmin: true, concursos: [QUIZ] });

      clicar('Editar');
      clicar('Excluir');

      await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
      expect(removerConcurso).toHaveBeenCalledWith(2);
      expect(screen.queryByRole('dialog', { name: 'Formulário' })).not.toBeInTheDocument();
    });

    it('alterna o destaque do concurso e recarrega a página', async () => {
      editarConcurso.mockResolvedValue({});
      await renderizar({ isAdmin: true, concursos: [COSPLAY] });

      clicar('Remover destaque');

      await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
      expect(editarConcurso).toHaveBeenCalledWith(1, { destaque: false });
    });

    it('registra o erro e não recarrega quando alternar o destaque falha', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const falha = new Error('falhou');
      editarConcurso.mockRejectedValue(falha);
      await renderizar({ isAdmin: true, concursos: [QUIZ] });

      clicar('Destacar concurso');

      await waitFor(() => expect(consoleError).toHaveBeenCalledWith('Erro ao alterar destaque:', falha));
      expect(reload).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('evento atual', () => {
    it.each([
      ['com a mensagem da API', new Error('Evento não encontrado'), 'Evento não encontrado'],
      ['com a mensagem padrão', {}, 'Não foi possível identificar o evento atual.']
    ])('mostra o erro ao admin %s', async (_descricao, falha, mensagem) => {
      buscarEventoAtual.mockRejectedValue(falha);
      await renderizar({ isAdmin: true });

      expect(await screen.findByText(mensagem)).toBeInTheDocument();
    });

    it('não mostra o erro do evento ao visitante', async () => {
      buscarEventoAtual.mockRejectedValue(new Error('Evento não encontrado'));
      await renderizar();

      expect(screen.queryByText('Evento não encontrado')).not.toBeInTheDocument();
    });

    it('ignora o resultado que chega depois de desmontar', async () => {
      let resolver;
      buscarEventoAtual.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
      configurar({ isAdmin: true });
      const { unmount } = render(<Contests />);

      unmount();
      await act(async () => resolver({ id: 1 }));

      expect(screen.queryByText(/evento:/)).not.toBeInTheDocument();
    });

    it('ignora a falha que chega depois de desmontar', async () => {
      let rejeitar;
      buscarEventoAtual.mockReturnValue(new Promise((_resolve, reject) => { rejeitar = reject; }));
      configurar({ isAdmin: true });
      const { unmount } = render(<Contests />);

      unmount();
      await act(async () => rejeitar(new Error('falhou')));

      expect(screen.queryByText('falhou')).not.toBeInTheDocument();
    });
  });
});
