import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ExpositorGrid from './ExpositorGrid';
import ExpositorImagem from './ExpositorImagem';
import { iniciaisDoNome, rotuloDoTipo } from './tiposExpositor';

const LOJA = {
  id: 1,
  nome: 'Loja Geek',
  tipo: 'loja',
  localizacaoEstande: 'Estande 12',
  imagem: 'https://cdn.exemplo.com/loja.png'
};

const ARTISTA = { id: 2, nome: 'Ateliê Sakura', tipo: 'artista', imagem: null };

describe('tiposExpositor', () => {
  it('rotuloDoTipo traduz o tipo e devolve o valor cru quando desconhecido', () => {
    expect(rotuloDoTipo('loja')).toBe('Loja');
    expect(rotuloDoTipo('artista')).toBe('Artista');
    expect(rotuloDoTipo('banda')).toBe('banda');
  });

  it('iniciaisDoNome usa a primeira e a última palavra', () => {
    expect(iniciaisDoNome('Loja Geek Joinville')).toBe('LJ');
    expect(iniciaisDoNome('rafa')).toBe('R');
    expect(iniciaisDoNome('   ')).toBe('?');
    expect(iniciaisDoNome()).toBe('?');
  });
});

describe('ExpositorImagem', () => {
  it('mostra a imagem quando a URL é http(s)', () => {
    render(<ExpositorImagem expositor={LOJA} />);
    expect(screen.getByRole('img', { name: 'Imagem de Loja Geek' })).toHaveAttribute('src', LOJA.imagem);
  });

  it('mostra as iniciais quando não há imagem ou a URL não é segura', () => {
    const { container, rerender } = render(<ExpositorImagem expositor={ARTISTA} />);
    expect(container).toHaveTextContent('AS');

    rerender(<ExpositorImagem expositor={{ ...ARTISTA, imagem: 'javascript:alert(1)' }} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('cai para as iniciais quando a imagem não carrega e tenta de novo se a URL mudar', () => {
    const { container, rerender } = render(<ExpositorImagem expositor={LOJA} />);

    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container).toHaveTextContent('LG');

    rerender(<ExpositorImagem expositor={{ ...LOJA, imagem: 'https://cdn.exemplo.com/nova.png' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn.exemplo.com/nova.png');
  });
});

describe('ExpositorGrid', () => {
  it('mostra o estado de carregamento', () => {
    render(<ExpositorGrid expositores={[]} carregando erro={null} />);
    expect(screen.getByText('Carregando expositores…')).toBeInTheDocument();
  });

  it('mostra o estado de erro', () => {
    render(<ExpositorGrid expositores={[]} carregando={false} erro={new Error('x')} />);
    expect(screen.getByText('Não foi possível carregar o catálogo. Tente novamente.')).toBeInTheDocument();
  });

  it('mostra a mensagem de vazio padrão ou a informada', () => {
    const { rerender } = render(<ExpositorGrid expositores={[]} carregando={false} erro={null} />);
    expect(screen.getByText('Nenhum expositor cadastrado ainda.')).toBeInTheDocument();

    rerender(<ExpositorGrid expositores={null} carregando={false} erro={null} mensagemVazio="Nada aqui." />);
    expect(screen.getByText('Nada aqui.')).toBeInTheDocument();
  });

  it('renderiza um card por expositor com nome, tipo e estande', () => {
    render(<ExpositorGrid expositores={[LOJA, ARTISTA]} carregando={false} erro={null} />);

    expect(screen.getByText('Loja Geek')).toBeInTheDocument();
    expect(screen.getByText('Loja')).toBeInTheDocument();
    expect(screen.getByText('📍 Estande 12')).toBeInTheDocument();
    expect(screen.getByText('Artista')).toBeInTheDocument();
  });

  it('abre o detalhe ao clicar no card', () => {
    const onAbrir = vi.fn();
    render(<ExpositorGrid expositores={[LOJA]} carregando={false} erro={null} onAbrir={onAbrir} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Loja Geek' }));
    expect(onAbrir).toHaveBeenCalledWith(LOJA);
  });

  it('mostra "Editar" só para admin', () => {
    const onEditar = vi.fn();
    const { rerender } = render(
      <ExpositorGrid expositores={[LOJA]} carregando={false} erro={null} onEditar={onEditar} />
    );
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();

    rerender(<ExpositorGrid expositores={[LOJA]} carregando={false} erro={null} isAdmin onEditar={onEditar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(onEditar).toHaveBeenCalledWith(LOJA);
  });

  it('não quebra quando os callbacks não são informados', () => {
    render(<ExpositorGrid expositores={[LOJA]} carregando={false} erro={null} isAdmin />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Loja Geek' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
  });
});
