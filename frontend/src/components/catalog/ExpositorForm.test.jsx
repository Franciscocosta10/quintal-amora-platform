import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ExpositorForm from './ExpositorForm';

const EXISTENTE = {
  id: 7,
  nome: 'Loja Geek',
  tipo: 'loja',
  descricao: 'Mangás',
  localizacaoEstande: 'Estande 12',
  contato: '(47) 99999-0000',
  imagem: 'https://cdn.exemplo.com/loja.png',
  redesSociais: { instagram: 'https://instagram.com/lojageek' }
};

function preencher(campos) {
  Object.entries(campos).forEach(([id, value]) => {
    fireEvent.change(document.getElementById(id), { target: { value } });
  });
}

async function submeter() {
  await act(async () => {
    fireEvent.submit(document.querySelector('form'));
  });
}

function alerta() {
  return screen.queryByRole('alert')?.textContent;
}

function renderizarNovo(props = {}) {
  const onSalvar = vi.fn().mockResolvedValue();
  const onCancelar = vi.fn();
  render(<ExpositorForm eventoId={1} onSalvar={onSalvar} onCancelar={onCancelar} {...props} />);
  return { onSalvar, onCancelar };
}

function renderizarEdicao(props = {}) {
  const onSalvar = vi.fn().mockResolvedValue();
  const onExcluir = vi.fn().mockResolvedValue();
  render(
    <ExpositorForm expositorInicial={EXISTENTE} onSalvar={onSalvar} onExcluir={onExcluir} {...props} />
  );
  return { onSalvar, onExcluir };
}

afterEach(() => {
  delete Element.prototype.scrollIntoView;
});

describe('ExpositorForm', () => {
  describe('cadastro', () => {
    it('abre vazio, com título de novo cadastro e campos obrigatórios marcados', () => {
      renderizarNovo();

      expect(screen.getByRole('heading', { name: 'Novo expositor' })).toBeInTheDocument();
      expect(document.getElementById('nome')).toHaveValue('');
      expect(document.getElementById('tipo')).toHaveValue('');
      expect(document.querySelectorAll('.required-mark')).toHaveLength(2);
      expect(screen.queryByRole('button', { name: 'Excluir expositor' })).not.toBeInTheDocument();
    });

    it('exige o nome', async () => {
      const { onSalvar } = renderizarNovo();
      preencher({ nome: '   ', tipo: 'loja' });

      await submeter();

      expect(alerta()).toContain('Informe o nome do expositor.');
      expect(onSalvar).not.toHaveBeenCalled();
    });

    it('exige o tipo', async () => {
      renderizarNovo();
      preencher({ nome: 'Loja X' });

      await submeter();

      expect(alerta()).toContain('Selecione se o expositor é uma loja ou um artista.');
    });

    it('rejeita imagem que não é link http(s)', async () => {
      renderizarNovo();
      preencher({ nome: 'Loja X', tipo: 'loja', imagem: 'javascript:alert(1)' });

      await submeter();

      expect(alerta()).toContain('A imagem deve ser um link começando com http:// ou https://.');
    });

    it('exige o evento atual para cadastrar', async () => {
      renderizarNovo({ eventoId: null });
      preencher({ nome: 'Loja X', tipo: 'loja' });

      await submeter();

      expect(alerta()).toContain('Não foi possível identificar o evento atual.');
    });

    it('envia os dados normalizados com o evento atual', async () => {
      const { onSalvar } = renderizarNovo();
      preencher({
        nome: '  Studio Kitsune ',
        tipo: 'artista',
        descricao: 'Chaveiros',
        localizacaoEstande: ' ',
        instagram: '@studio.kitsune',
        site: 'kitsune.art'
      });

      await submeter();

      expect(onSalvar).toHaveBeenCalledWith({
        nome: 'Studio Kitsune',
        tipo: 'artista',
        descricao: 'Chaveiros',
        localizacaoEstande: null,
        contato: null,
        imagem: null,
        redesSociais: {
          instagram: 'https://instagram.com/studio.kitsune',
          site: 'https://kitsune.art'
        },
        evento: 1
      });
      expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
    });

    it('envia redesSociais null quando nenhuma rede é informada', async () => {
      const { onSalvar } = renderizarNovo();
      preencher({ nome: 'Loja X', tipo: 'loja' });

      await submeter();

      expect(onSalvar.mock.calls[0][0].redesSociais).toBeNull();
    });

    it('mostra o erro do backend e libera o botão de novo', async () => {
      const { onSalvar } = renderizarNovo();
      onSalvar.mockRejectedValueOnce(new Error('Evento informado não existe.'));
      preencher({ nome: 'Loja X', tipo: 'loja' });

      await submeter();

      expect(alerta()).toContain('Evento informado não existe.');
      expect(screen.getByRole('button', { name: 'Adicionar expositor' })).toBeEnabled();
    });

    it('usa mensagem padrão quando o erro não tem mensagem', async () => {
      const { onSalvar } = renderizarNovo();
      onSalvar.mockRejectedValueOnce(new Error(''));
      preencher({ nome: 'Loja X', tipo: 'loja' });

      await submeter();

      expect(alerta()).toContain('Não foi possível salvar o expositor.');
    });

    it('limpa o erro quando o usuário volta a digitar', async () => {
      renderizarNovo();
      await submeter();
      expect(alerta()).toBeDefined();

      preencher({ nome: 'L' });

      expect(alerta()).toBeUndefined();
    });

    it('rola o alerta para a vista quando um erro aparece', async () => {
      Element.prototype.scrollIntoView = vi.fn();
      renderizarNovo();

      await submeter();

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it('mostra a pré-visualização só para link válido e a esconde se a imagem falhar', () => {
      renderizarNovo();
      expect(screen.queryByAltText('Pré-visualização da imagem')).not.toBeInTheDocument();

      preencher({ imagem: 'https://cdn.exemplo.com/a.png' });
      const preview = screen.getByAltText('Pré-visualização da imagem');
      expect(preview).toBeVisible();

      fireEvent.error(preview);
      expect(preview).not.toBeVisible();
    });

    it('fecha pelos botões Cancelar e ×', () => {
      const { onCancelar } = renderizarNovo();

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

      expect(onCancelar).toHaveBeenCalledTimes(2);
    });
  });

  describe('edição', () => {
    it('abre preenchido com os dados do expositor', () => {
      renderizarEdicao();

      expect(screen.getByRole('heading', { name: 'Editar expositor' })).toBeInTheDocument();
      expect(document.getElementById('nome')).toHaveValue('Loja Geek');
      expect(document.getElementById('tipo')).toHaveValue('loja');
      expect(document.getElementById('instagram')).toHaveValue('https://instagram.com/lojageek');
      expect(document.getElementById('site')).toHaveValue('');
      expect(screen.getByAltText('Pré-visualização da imagem')).toBeInTheDocument();
    });

    it('abre com campos vazios quando o expositor não tem dados opcionais', () => {
      render(
        <ExpositorForm expositorInicial={{ id: 1, nome: 'Rafa', tipo: 'artista' }} onSalvar={vi.fn()} />
      );

      expect(document.getElementById('descricao')).toHaveValue('');
      expect(document.getElementById('instagram')).toHaveValue('');
    });

    it('não envia o evento (não é editável) e não exige eventoId', async () => {
      const { onSalvar } = renderizarEdicao();
      preencher({ nome: 'Loja Geek 2' });

      await submeter();

      const dados = onSalvar.mock.calls[0][0];
      expect(dados.nome).toBe('Loja Geek 2');
      expect(dados).not.toHaveProperty('evento');
      expect(screen.getByRole('button', { name: 'Salvando...' })).toBeInTheDocument();
    });

    it('confirma antes de excluir e permite desistir', () => {
      const { onExcluir } = renderizarEdicao();

      fireEvent.click(screen.getByRole('button', { name: 'Excluir expositor' }));
      expect(screen.getByRole('dialog', { name: 'Excluir expositor?' })).toHaveTextContent('"Loja Geek"');

      fireEvent.click(screen.getAllByRole('button', { name: 'Cancelar' })[1]);

      expect(screen.queryByRole('dialog', { name: 'Excluir expositor?' })).not.toBeInTheDocument();
      expect(onExcluir).not.toHaveBeenCalled();
    });

    it('exclui pelo id ao confirmar', async () => {
      const { onExcluir } = renderizarEdicao();

      fireEvent.click(screen.getByRole('button', { name: 'Excluir expositor' }));
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));
      });

      expect(onExcluir).toHaveBeenCalledWith(7);
      expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled();
    });

    it('mostra o erro quando a exclusão falha', async () => {
      const { onExcluir } = renderizarEdicao();
      onExcluir.mockRejectedValueOnce(new Error('Sem permissão.'));

      fireEvent.click(screen.getByRole('button', { name: 'Excluir expositor' }));
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));
      });

      expect(alerta()).toContain('Sem permissão.');
      expect(screen.queryByRole('dialog', { name: 'Excluir expositor?' })).not.toBeInTheDocument();
    });

    it('usa mensagem padrão quando a exclusão falha sem mensagem', async () => {
      const { onExcluir } = renderizarEdicao();
      onExcluir.mockRejectedValueOnce(new Error(''));

      fireEvent.click(screen.getByRole('button', { name: 'Excluir expositor' }));
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));
      });

      expect(alerta()).toContain('Não foi possível excluir o expositor.');
    });
  });
});
