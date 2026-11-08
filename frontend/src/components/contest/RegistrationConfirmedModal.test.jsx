import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import RegistrationConfirmedModal from './RegistrationConfirmedModal';

describe('RegistrationConfirmedModal', () => {
  it('não renderiza nada sem concurso', () => {
    const { container } = render(<RegistrationConfirmedModal concurso={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra o nome do concurso e chama onFechar ao clicar em OK', () => {
    const onFechar = vi.fn();
    render(<RegistrationConfirmedModal concurso={{ nome: 'Quiz Geek' }} onFechar={onFechar} />);

    expect(screen.getByRole('dialog')).toHaveTextContent('Quiz Geek');

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onFechar).toHaveBeenCalledTimes(1);
  });
});
