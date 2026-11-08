import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContestItem from './ContestItem';

function criarConcurso(overrides = {}) {
  return {
    id: 1,
    nome: 'Concurso de Cosplay',
    categoria: 'cosplay',
    descricao: 'Descrição de teste',
    dataHoraInicio: new Date('2026-11-20T14:00:00-03:00').getTime(),
    status: 'aberto',
    limiteParticipantes: 10,
    totalInscritos: 3,
    destaque: false,
    ...overrides
  };
}

describe('ContestItem', () => {
  describe('visão do visitante', () => {
    it('mostra "Inscrever-se" habilitado quando não está inscrito e as inscrições estão abertas', () => {
      render(<ContestItem concurso={criarConcurso()} isAdmin={false} />);
      expect(screen.getByRole('button', { name: 'Inscrever-se' })).toBeEnabled();
    });

    it('chama onInscrever com o id do concurso ao clicar em "Inscrever-se"', () => {
      const onInscrever = vi.fn();
      render(<ContestItem concurso={criarConcurso({ id: 7 })} isAdmin={false} onInscrever={onInscrever} />);

      fireEvent.click(screen.getByRole('button', { name: 'Inscrever-se' }));
      expect(onInscrever).toHaveBeenCalledWith(7);
    });

    it('mostra "Inscrito ✓ Cancelar" quando o usuário já está inscrito', () => {
      render(<ContestItem concurso={criarConcurso()} isAdmin={false} inscricaoId={55} />);

      expect(screen.getByRole('button', { name: 'Inscrito ✓ Cancelar' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Inscrever-se' })).not.toBeInTheDocument();
    });

    it('chama onCancelar com o id da inscrição ao clicar em cancelar', () => {
      const onCancelar = vi.fn();
      render(
        <ContestItem concurso={criarConcurso()} isAdmin={false} inscricaoId={55} onCancelar={onCancelar} />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Inscrito ✓ Cancelar' }));
      expect(onCancelar).toHaveBeenCalledWith(55);
    });

    it('desabilita e mostra "Encerrado" quando o concurso não está mais aberto', () => {
      render(<ContestItem concurso={criarConcurso({ status: 'encerrado' })} isAdmin={false} />);
      expect(screen.getByRole('button', { name: 'Encerrado' })).toBeDisabled();
    });

    it('chama onAlternarFavorito com o id do concurso ao clicar na estrela de favorito', () => {
      const onAlternarFavorito = vi.fn();
      render(
        <ContestItem
          concurso={criarConcurso({ id: 9 })}
          isAdmin={false}
          onAlternarFavorito={onAlternarFavorito}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Adicionar aos favoritos' }));
      expect(onAlternarFavorito).toHaveBeenCalledWith(9);
    });

    it('não mostra os botões de admin (destaque/editar) para o visitante', () => {
      render(<ContestItem concurso={criarConcurso()} isAdmin={false} />);
      expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    });

    it('mostra a estrela de favorito já marcada quando favorito é true', () => {
  render(<ContestItem concurso={criarConcurso()} isAdmin={false} favorito={true} />);
  expect(screen.getByRole('button', { name: 'Remover dos favoritos' })).toBeInTheDocument();
    });
  });

  describe('visão do administrador', () => {
    it('mostra o botão Editar e a estrela de destaque, não os botões de inscrição', () => {
      render(<ContestItem concurso={criarConcurso()} isAdmin={true} />);

      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Destacar concurso' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Inscrever-se' })).not.toBeInTheDocument();
    });

    it('chama onEditar com o concurso inteiro ao clicar em Editar', () => {
      const onEditar = vi.fn();
      const concurso = criarConcurso();
      render(<ContestItem concurso={concurso} isAdmin={true} onEditar={onEditar} />);

      fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
      expect(onEditar).toHaveBeenCalledWith(concurso);
    });

    it('chama onAlternarDestaque com o concurso ao clicar na estrela', () => {
      const onAlternarDestaque = vi.fn();
      const concurso = criarConcurso();
      render(<ContestItem concurso={concurso} isAdmin={true} onAlternarDestaque={onAlternarDestaque} />);

      fireEvent.click(screen.getByRole('button', { name: 'Destacar concurso' }));
      expect(onAlternarDestaque).toHaveBeenCalledWith(concurso);
    });

    it('mostra o label "Remover destaque" quando o concurso já está destacado', () => {
      render(<ContestItem concurso={criarConcurso({ destaque: true })} isAdmin={true} />);
      expect(screen.getByRole('button', { name: 'Remover destaque' })).toBeInTheDocument();
    });
  });

  describe('categoria', () => {
    it('mostra o label fixo correspondente à categoria', () => {
      render(<ContestItem concurso={criarConcurso({ categoria: 'quiz' })} isAdmin={false} />);
      expect(screen.getByText('Quiz')).toBeInTheDocument();
    });

    it('usa a categoria "Outro" quando a categoria não bate com nenhuma conhecida', () => {
      render(<ContestItem concurso={criarConcurso({ categoria: 'xyz-desconhecida' })} isAdmin={false} />);
      expect(screen.getByText('Outro')).toBeInTheDocument();
    });

    describe('formatação de horário', () => {
  it('não quebra e renderiza vazio quando dataHoraInicio não é informado', () => {
    render(<ContestItem concurso={criarConcurso({ dataHoraInicio: null })} isAdmin={false} />);
    // só confirma que renderizou sem lançar erro e sem mostrar "Invalid Date"
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
  });
});

describe('descrição opcional', () => {
  it('não renderiza o parágrafo de descrição quando o concurso não tem descrição', () => {
    render(<ContestItem concurso={criarConcurso({ descricao: '' })} isAdmin={false} />);
    expect(document.querySelector('.contest-item__description')).toBeNull();
  });
});

describe('props de callback ausentes (visitante)', () => {
  it('não quebra ao clicar em Inscrever-se quando onInscrever não foi passado', () => {
    render(<ContestItem concurso={criarConcurso()} isAdmin={false} />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Inscrever-se' }));
    }).not.toThrow();
  });

  it('não quebra ao clicar em cancelar quando onCancelar não foi passado', () => {
    render(<ContestItem concurso={criarConcurso()} isAdmin={false} inscricaoId={1} />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Inscrito ✓ Cancelar' }));
    }).not.toThrow();
  });

  it('não quebra ao clicar na estrela de favorito quando onAlternarFavorito não foi passado', () => {
    render(<ContestItem concurso={criarConcurso()} isAdmin={false} />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Adicionar aos favoritos' }));
    }).not.toThrow();
  });
});

describe('props de callback ausentes (admin)', () => {
  it('não quebra ao clicar em Editar quando onEditar não foi passado', () => {
    render(<ContestItem concurso={criarConcurso()} isAdmin={true} />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    }).not.toThrow();
  });

  it('não quebra ao clicar na estrela de destaque quando onAlternarDestaque não foi passado', () => {
    render(<ContestItem concurso={criarConcurso()} isAdmin={true} />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Destacar concurso' }));
    }).not.toThrow();
  });
});
});

  describe('contagem de inscritos', () => {
    it('mostra "X/Y inscritos" quando há limite de participantes', () => {
      render(
        <ContestItem
          concurso={criarConcurso({ totalInscritos: 3, limiteParticipantes: 10 })}
          isAdmin={false}
        />
      );
      expect(screen.getByText(/3\/10 inscritos/)).toBeInTheDocument();
    });

    it('mostra "X inscrito(s)" quando não há limite de participantes', () => {
      render(
        <ContestItem
          concurso={criarConcurso({ totalInscritos: 5, limiteParticipantes: null })}
          isAdmin={false}
        />
      );
      expect(screen.getByText(/5 inscrito\(s\)/)).toBeInTheDocument();
    });

    it('aplica a classe de "quase lotado" a partir de 80% da capacidade', () => {
      const { container } = render(
        <ContestItem concurso={criarConcurso({ totalInscritos: 8, limiteParticipantes: 10 })} isAdmin={false} />
      );
      expect(container.querySelector('.contest-item__status--quase-lotado')).not.toBeNull();
      expect(container.querySelector('.contest-item__status--lotado')).toBeNull();
    });

    it('aplica a classe de "lotado" quando atinge o limite', () => {
      const { container } = render(
        <ContestItem concurso={criarConcurso({ totalInscritos: 10, limiteParticipantes: 10 })} isAdmin={false} />
      );
      expect(container.querySelector('.contest-item__status--lotado')).not.toBeNull();
    });

    it('não aplica nenhuma classe de alerta quando ainda há bastante vaga', () => {
      const { container } = render(
        <ContestItem concurso={criarConcurso({ totalInscritos: 1, limiteParticipantes: 10 })} isAdmin={false} />
      );
      expect(container.querySelector('.contest-item__status--quase-lotado')).toBeNull();
      expect(container.querySelector('.contest-item__status--lotado')).toBeNull();
    });

    describe('status desconhecido', () => {
  it('mostra o valor cru de status quando ele não está em STATUS_LABEL', () => {
    render(<ContestItem concurso={criarConcurso({ status: 'xyz-nao-mapeado' })} isAdmin={false} />);
    expect(screen.getByText(/xyz-nao-mapeado/)).toBeInTheDocument();
     });
    });
    it('mostra "0/Y inscritos" quando totalInscritos é undefined e há limite', () => {
  render(
    <ContestItem
      concurso={criarConcurso({ totalInscritos: undefined, limiteParticipantes: 10 })}
      isAdmin={false}
    />
  );
  expect(screen.getByText(/0\/10 inscritos/)).toBeInTheDocument();
});

it('mostra "0 inscrito(s)" quando totalInscritos é undefined e não há limite', () => {
  render(
    <ContestItem
      concurso={criarConcurso({ totalInscritos: undefined, limiteParticipantes: null })}
      isAdmin={false}
    />
  );
  expect(screen.getByText(/0 inscrito\(s\)/)).toBeInTheDocument();
    });
  });
});