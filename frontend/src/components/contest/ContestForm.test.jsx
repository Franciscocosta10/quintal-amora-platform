import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContestForm from './ContestForm';

// O DatePicker tem testes próprios; aqui um input simples permite informar
// qualquer valor, inclusive datas inválidas.
vi.mock('../DatePicker', () => ({
  default: ({ id, name, value, onChange }) => (
    <input id={id} name={name} value={value} onChange={onChange} />
  )
}));

const CAMPOS_VALIDOS = {
  nome: 'Concurso de Cosplay',
  dataConcurso: '2099-06-20',
  horaInicio: '14:00',
  horaTermino: '16:00',
  inscricaoDataInicio: '2099-06-01',
  inscricaoDataFim: '2099-06-10'
};

const CONCURSO_EXISTENTE = {
  id: 7,
  nome: 'Quiz Geek',
  categoria: 'quiz',
  descricao: 'Perguntas e respostas',
  limiteParticipantes: 20,
  dataHoraInicio: new Date('2020-06-20T14:00:00-03:00').getTime(),
  dataHoraFim: new Date('2020-06-20T16:00:00-03:00').getTime(),
  inicioInscricao: new Date('2020-06-01T00:00:00-03:00').getTime(),
  fimInscricao: new Date('2020-06-10T23:59:59-03:00').getTime()
};

function preencher(campos) {
  Object.entries(campos).forEach(([name, value]) => {
    fireEvent.change(document.getElementById(name), { target: { value } });
  });
}

function submeter() {
  fireEvent.submit(document.querySelector('form'));
}

function renderizarNovo(props = {}) {
  const onSalvar = vi.fn().mockResolvedValue();
  render(<ContestForm eventoId={3} onSalvar={onSalvar} {...props} />);
  return { onSalvar };
}

function renderizarEdicao(props = {}) {
  const onSalvar = vi.fn().mockResolvedValue();
  const onExcluir = vi.fn().mockResolvedValue();
  render(
    <ContestForm
      concursoInicial={CONCURSO_EXISTENTE}
      onSalvar={onSalvar}
      onExcluir={onExcluir}
      {...props}
    />
  );
  return { onSalvar, onExcluir };
}

describe('ContestForm', () => {
  describe('validações', () => {
    it.each([
      ['nome em branco', { nome: '   ' }, 'Informe o nome do concurso.'],
      ['sem data do concurso', { dataConcurso: '' }, 'Informe a data e o horário de início do concurso.'],
      ['sem horário de início', { horaInicio: '' }, 'Informe a data e o horário de início do concurso.'],
      ['sem horário de término', { horaTermino: '' }, 'Informe o horário de término do concurso.'],
      ['sem início das inscrições', { inscricaoDataInicio: '' }, 'Informe a data de início das inscrições.'],
      ['sem término das inscrições', { inscricaoDataFim: '' }, 'Informe a data de término das inscrições.'],
      ['limite zero', { limiteParticipantes: '0' }, 'O limite de participantes deve ser maior que zero.'],
      ['limite negativo', { limiteParticipantes: '-1' }, 'O limite de participantes deve ser maior que zero.'],
      [
        'data no passado',
        { dataConcurso: '2000-01-01', inscricaoDataInicio: '1999-01-01', inscricaoDataFim: '1999-01-02' },
        'A data do concurso não pode ser no passado.'
      ],
      ['data do concurso inválida', { dataConcurso: '2099-13-45' }, 'Data ou horário inválido.'],
      ['início das inscrições inválido', { inscricaoDataInicio: '2099-13-45' }, 'Data ou horário inválido.'],
      ['término das inscrições inválido', { inscricaoDataFim: '2099-13-45' }, 'Data ou horário inválido.'],
      ['término igual ao início', { horaTermino: '14:00' }, 'O horário de término deve ser depois do horário de início.'],
      ['término antes do início', { horaTermino: '13:00' }, 'O horário de término deve ser depois do horário de início.'],
      [
        'inscrições com início depois do término',
        { inscricaoDataInicio: '2099-06-11' },
        'A data de início das inscrições não pode ser depois do término.'
      ],
      [
        'inscrições encerrando depois do início do concurso',
        { inscricaoDataFim: '2099-06-21' },
        'As inscrições precisam encerrar antes do início do concurso.'
      ]
    ])('rejeita %s', (_descricao, sobrescritos, mensagem) => {
      const { onSalvar } = renderizarNovo();

      preencher({ ...CAMPOS_VALIDOS, ...sobrescritos });
      submeter();

      expect(screen.getByRole('alert')).toHaveTextContent(mensagem);
      expect(onSalvar).not.toHaveBeenCalled();
    });

    it('rejeita a criação quando o evento atual não foi identificado', () => {
      const { onSalvar } = renderizarNovo({ eventoId: null });

      preencher(CAMPOS_VALIDOS);
      submeter();

      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível identificar o evento atual.');
      expect(onSalvar).not.toHaveBeenCalled();
    });

    it('limpa o erro quando o usuário altera um campo', () => {
      renderizarNovo();

      submeter();
      expect(screen.getByRole('alert')).toBeInTheDocument();

      preencher({ nome: 'Novo nome' });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('criação', () => {
    it('envia os dados normalizados, com o evento, e mostra a mensagem de sucesso', async () => {
      const { onSalvar } = renderizarNovo();

      expect(screen.getByRole('heading', { name: 'Novo concurso' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Excluir concurso' })).not.toBeInTheDocument();

      preencher({
        ...CAMPOS_VALIDOS,
        nome: '  Concurso de Cosplay  ',
        descricao: '  Traga sua fantasia  ',
        categoria: 'cosplay',
        limiteParticipantes: '15'
      });
      submeter();

      expect(await screen.findByRole('status')).toHaveTextContent('Concurso criado com sucesso!');
      expect(onSalvar).toHaveBeenCalledWith({
        nome: 'Concurso de Cosplay',
        categoria: 'cosplay',
        descricao: 'Traga sua fantasia',
        dataHoraInicio: new Date('2099-06-20T14:00:00-03:00').getTime(),
        dataHoraFim: new Date('2099-06-20T16:00:00-03:00').getTime(),
        limiteParticipantes: 15,
        inicioInscricao: new Date('2099-06-01T00:00:00-03:00').getTime(),
        fimInscricao: new Date('2099-06-10T23:59:59-03:00').getTime(),
        evento: 3
      });
    });

    it('envia descrição e limite como null quando não preenchidos', async () => {
      const { onSalvar } = renderizarNovo();

      preencher(CAMPOS_VALIDOS);
      submeter();

      await screen.findByRole('status');
      expect(onSalvar.mock.calls[0][0]).toMatchObject({
        categoria: 'outro',
        descricao: null,
        limiteParticipantes: null
      });
    });

    it('bloqueia os botões e mostra "Salvando..." enquanto salva', async () => {
      let concluirSalvamento;
      const onSalvar = vi.fn(() => new Promise((resolve) => { concluirSalvamento = resolve; }));
      render(<ContestForm eventoId={3} onSalvar={onSalvar} />);

      preencher(CAMPOS_VALIDOS);
      submeter();

      expect(await screen.findByRole('button', { name: 'Salvando...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Fechar' })).toBeDisabled();

      await act(async () => concluirSalvamento());
      expect(screen.getByRole('button', { name: 'Adicionar concurso' })).toBeEnabled();
    });

    it('mostra a mensagem do erro quando salvar falha', async () => {
      const { onSalvar } = renderizarNovo();
      onSalvar.mockRejectedValue(new Error('Erro do servidor'));

      preencher(CAMPOS_VALIDOS);
      submeter();

      expect(await screen.findByRole('alert')).toHaveTextContent('Erro do servidor');
    });

    it('usa a mensagem padrão quando o erro ao salvar não tem mensagem', async () => {
      const { onSalvar } = renderizarNovo();
      onSalvar.mockRejectedValue({});

      preencher(CAMPOS_VALIDOS);
      submeter();

      expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar o concurso.');
    });

    it('chama onCancelar pelos botões Cancelar e Fechar', () => {
      const onCancelar = vi.fn();
      renderizarNovo({ onCancelar });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

      expect(onCancelar).toHaveBeenCalledTimes(2);
    });
  });

  describe('edição', () => {
    it('preenche o formulário com os dados do concurso', () => {
      renderizarEdicao();

      expect(screen.getByRole('heading', { name: 'Editar concurso' })).toBeInTheDocument();
      expect(document.getElementById('nome')).toHaveValue('Quiz Geek');
      expect(document.getElementById('categoria')).toHaveValue('quiz');
      expect(document.getElementById('descricao')).toHaveValue('Perguntas e respostas');
      expect(document.getElementById('limiteParticipantes')).toHaveValue(20);
      expect(document.getElementById('dataConcurso')).toHaveValue('2020-06-20');
      expect(document.getElementById('horaInicio')).toHaveValue('14:00');
      expect(document.getElementById('horaTermino')).toHaveValue('16:00');
      expect(document.getElementById('inscricaoDataInicio')).toHaveValue('2020-06-01');
      expect(document.getElementById('inscricaoDataFim')).toHaveValue('2020-06-10');
    });

    it('aceita campos opcionais ausentes no concurso existente', () => {
      render(<ContestForm concursoInicial={{ id: 1 }} onSalvar={vi.fn()} />);

      expect(document.getElementById('nome')).toHaveValue('');
      expect(document.getElementById('categoria')).toHaveValue('outro');
      expect(document.getElementById('limiteParticipantes')).toHaveValue(null);
      expect(document.getElementById('dataConcurso')).toHaveValue('');
    });

    it('salva sem exigir evento, sem enviar evento e aceitando data no passado', async () => {
      const { onSalvar } = renderizarEdicao();

      fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(await screen.findByRole('status')).toHaveTextContent('Concurso atualizado com sucesso!');
      expect(onSalvar.mock.calls[0][0]).not.toHaveProperty('evento');
      expect(onSalvar.mock.calls[0][0].nome).toBe('Quiz Geek');
    });
  });

  describe('exclusão', () => {
    function abrirModal() {
      fireEvent.click(screen.getByRole('button', { name: 'Excluir concurso' }));
      return screen.getByRole('dialog', { name: 'Excluir concurso?' });
    }

    it('pede confirmação antes de excluir e permite desistir', () => {
      const { onExcluir } = renderizarEdicao();

      const modal = abrirModal();
      expect(modal).toHaveTextContent('Quiz Geek');

      fireEvent.click(modal.querySelector('.contest-form__cancel'));

      expect(screen.queryByRole('dialog', { name: 'Excluir concurso?' })).not.toBeInTheDocument();
      expect(onExcluir).not.toHaveBeenCalled();
    });

    it('exclui pelo id e fecha o modal ao confirmar', async () => {
      const { onExcluir } = renderizarEdicao();

      abrirModal();
      fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Excluir concurso?' })).not.toBeInTheDocument();
      });
      expect(onExcluir).toHaveBeenCalledWith(7);
    });

    it('bloqueia os botões e mostra "Excluindo..." enquanto exclui', async () => {
      const onExcluir = vi.fn(() => new Promise(() => {}));
      renderizarEdicao({ onExcluir });

      const modal = abrirModal();
      fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));

      expect(await screen.findByRole('button', { name: 'Excluindo...' })).toBeDisabled();
      expect(modal.querySelector('.contest-form__cancel')).toBeDisabled();
    });

    it('mantém o modal aberto e mostra o erro quando a exclusão falha', async () => {
      const onExcluir = vi.fn().mockRejectedValue(new Error('Sem permissão'));
      renderizarEdicao({ onExcluir });

      abrirModal();
      fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Sem permissão');
      expect(screen.getByRole('button', { name: 'Sim, excluir' })).toBeEnabled();
    });

    it('usa a mensagem padrão quando o erro ao excluir não tem mensagem', async () => {
      const onExcluir = vi.fn().mockRejectedValue({});
      renderizarEdicao({ onExcluir });

      abrirModal();
      fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível excluir o concurso.');
    });

    it('não chama onExcluir quando o concurso não tem id', () => {
      const onExcluir = vi.fn();
      render(<ContestForm concursoInicial={{ nome: 'Sem id' }} onSalvar={vi.fn()} onExcluir={onExcluir} />);

      abrirModal();
      fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));

      expect(onExcluir).not.toHaveBeenCalled();
    });
  });
});
