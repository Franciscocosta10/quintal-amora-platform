import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ScheduleList from './ScheduleList';

const ATIVIDADES = [
  { id: 1, titulo: 'Desfile Cosplay', tipo: 'outro', dataHoraInicio: new Date(2026, 10, 21, 14, 0).getTime() },
  { id: 2, titulo: 'Karaokê', tipo: 'outro', dataHoraInicio: new Date(2026, 10, 21, 16, 0).getTime() }
];

describe('ScheduleList — estrela de favorito', () => {
  it('marca as favoritas e avisa o clique com o id da atividade', () => {
    const onAlternarFavorito = vi.fn();
    render(
      <ScheduleList
        atividades={ATIVIDADES}
        ehFavorito={(id) => id === 2}
        onAlternarFavorito={onAlternarFavorito}
      />
    );

    expect(screen.getByRole('button', { name: 'Remover dos favoritos' })).toHaveTextContent('★');

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar aos favoritos' }));
    expect(onAlternarFavorito).toHaveBeenCalledWith(1);
  });

  // Ex.: a Home para o admin, que não favorita atividades.
  it('não mostra a estrela quando a tela não liga os favoritos', () => {
    render(<ScheduleList atividades={ATIVIDADES} />);

    expect(screen.getByText('Desfile Cosplay')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /favoritos/ })).not.toBeInTheDocument();
  });
});
