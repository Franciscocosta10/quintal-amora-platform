import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ContestList from './ContestList';

function criarConcurso(overrides = {}) {
  return {
    id: 1,
    nome: 'Concurso de Cosplay',
    categoria: 'cosplay',
    status: 'aberto',
    totalInscritos: 0,
    ...overrides
  };
}

describe('ContestList', () => {
  it('mostra o estado de carregamento', () => {
    render(<ContestList concursos={[]} carregando />);
    expect(screen.getByText('Carregando concursos…')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro', () => {
    render(<ContestList concursos={[]} erro={new Error('falhou')} />);
    expect(screen.getByText(/Não foi possível carregar os concursos/)).toBeInTheDocument();
  });

  it('mostra o estado vazio quando a lista é vazia ou não foi informada', () => {
    const { rerender } = render(<ContestList concursos={[]} />);
    expect(screen.getByText(/Nenhum concurso cadastrado/)).toBeInTheDocument();

    rerender(<ContestList concursos={null} />);
    expect(screen.getByText(/Nenhum concurso cadastrado/)).toBeInTheDocument();
  });

  it('repassa inscrição e favorito de cada concurso para o item', () => {
    const onCancelar = vi.fn();

    render(
      <ContestList
        concursos={[
          criarConcurso({ id: 1, nome: 'Inscrito e favorito' }),
          criarConcurso({ id: 2, nome: 'Sem inscrição' })
        ]}
        minhasInscricoesPorConcurso={{ 1: 55 }}
        ehFavorito={(id) => id === 1}
        onCancelar={onCancelar}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Inscrito ✓ Cancelar' }));
    expect(onCancelar).toHaveBeenCalledWith(55);

    expect(screen.getByRole('button', { name: 'Inscrever-se' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover dos favoritos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar aos favoritos' })).toBeInTheDocument();
  });

  it('funciona sem a função ehFavorito', () => {
    render(<ContestList concursos={[criarConcurso()]} minhasInscricoesPorConcurso={{}} />);
    expect(screen.getByRole('button', { name: 'Adicionar aos favoritos' })).toBeInTheDocument();
  });
});
