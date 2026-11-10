import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ExpositorDetailModal from './ExpositorDetailModal';

const COMPLETO = {
  id: 3,
  nome: 'Loja Geek',
  tipo: 'loja',
  descricao: 'Mangás e action figures.',
  localizacaoEstande: 'Estande 12',
  contato: '(47) 99999-0000',
  imagem: null,
  redesSociais: {
    instagram: 'https://instagram.com/lojageek',
    site: 'https://lojageek.com.br',
    tiktok: 'javascript:alert(1)'
  }
};

const MINIMO = { id: 4, nome: 'Rafa Ilustra', tipo: 'artista' };

describe('ExpositorDetailModal', () => {
  it('não renderiza nada sem expositor', () => {
    const { container } = render(<ExpositorDetailModal expositor={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra nome, tipo, estande, descrição, contato e redes', () => {
    render(<ExpositorDetailModal expositor={COMPLETO} />);

    expect(screen.getByRole('dialog', { name: 'Loja Geek' })).toBeInTheDocument();
    expect(screen.getByText('Loja')).toBeInTheDocument();
    expect(screen.getByText('📍 Estande 12')).toBeInTheDocument();
    expect(screen.getByText('Mangás e action figures.')).toBeInTheDocument();
    expect(screen.getByText('(47) 99999-0000')).toBeInTheDocument();

    const instagram = screen.getByRole('link', { name: /instagram\.com\/lojageek/ });
    expect(instagram).toHaveAttribute('href', 'https://instagram.com/lojageek');
    expect(instagram).toHaveAttribute('target', '_blank');
    expect(instagram).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: /lojageek\.com\.br/ })).toBeInTheDocument();
  });

  it('ignora links que não são http(s)', () => {
    render(<ExpositorDetailModal expositor={COMPLETO} />);
    expect(screen.queryByText('TikTok')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('mostra aviso de descrição vazia e omite a seção de contatos quando não há dados', () => {
    render(<ExpositorDetailModal expositor={MINIMO} />);

    expect(screen.getByText('Este expositor ainda não tem descrição.')).toBeInTheDocument();
    expect(screen.queryByText('Contato')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('mostra só o contato quando não há redes', () => {
    render(<ExpositorDetailModal expositor={{ ...MINIMO, contato: 'rafa@exemplo.com', redesSociais: null }} />);

    expect(screen.getByText('rafa@exemplo.com')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('mostra só as redes quando não há contato', () => {
    render(<ExpositorDetailModal expositor={{ ...MINIMO, redesSociais: { site: 'https://rafa.art' } }} />);

    expect(screen.queryByText('Contato')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /rafa\.art/ })).toBeInTheDocument();
  });

  it('fecha no botão ×, no Esc e ao clicar fora — mas não ao clicar dentro', () => {
    const onFechar = vi.fn();
    render(<ExpositorDetailModal expositor={COMPLETO} onFechar={onFechar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.mouseDown(screen.getByRole('dialog'));
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement);

    expect(onFechar).toHaveBeenCalledTimes(3);
  });

  it('não quebra no Esc ou clique fora sem onFechar', () => {
    render(<ExpositorDetailModal expositor={COMPLETO} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement);
  });

  it('remove o listener de teclado ao fechar', () => {
    const onFechar = vi.fn();
    const { rerender } = render(<ExpositorDetailModal expositor={COMPLETO} onFechar={onFechar} />);

    rerender(<ExpositorDetailModal expositor={null} onFechar={onFechar} />);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onFechar).not.toHaveBeenCalled();
  });

  it('mostra "Editar expositor" só para admin', () => {
    const onEditar = vi.fn();
    const { rerender } = render(<ExpositorDetailModal expositor={COMPLETO} onEditar={onEditar} />);
    expect(screen.queryByRole('button', { name: 'Editar expositor' })).not.toBeInTheDocument();

    rerender(<ExpositorDetailModal expositor={COMPLETO} isAdmin onEditar={onEditar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar expositor' }));
    expect(onEditar).toHaveBeenCalledWith(COMPLETO);
  });

  it('não quebra ao clicar em "Editar expositor" sem onEditar', () => {
    render(<ExpositorDetailModal expositor={COMPLETO} isAdmin />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar expositor' }));
  });
});
