import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChangePhoto from './ChangePhoto';
import { useAuth } from '../../hooks/useAuth';
import { atualizarFotoPerfil } from '../../services/perfil';
import { redimensionarFoto } from '../../utils/redimensionarFoto';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../services/perfil', () => ({ atualizarFotoPerfil: vi.fn() }));
// jsdom não tem canvas: a redução da imagem é testada à parte.
vi.mock('../../utils/redimensionarFoto', () => ({ redimensionarFoto: vi.fn() }));

const FOTO_REDUZIDA = 'data:image/jpeg;base64,REDUZIDA';
const atualizarUsuario = vi.fn();

function renderizar(usuario = { nomeCompleto: 'Ana Souza', fotoPerfil: null }) {
  useAuth.mockReturnValue({ usuario, atualizarUsuario });
  render(<MemoryRouter><ChangePhoto /></MemoryRouter>);
}

async function escolher(arquivo) {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/Selecionar nova imagem|Escolher outra imagem/), { target: { files: [arquivo] } });
  });
}

const imagem = (tipo = 'image/png', tamanho = 1000) => {
  const arquivo = new File(['x'], 'foto', { type: tipo });
  Object.defineProperty(arquivo, 'size', { value: tamanho });
  return arquivo;
};

beforeEach(() => {
  vi.clearAllMocks();
  redimensionarFoto.mockResolvedValue(FOTO_REDUZIDA);
  atualizarFotoPerfil.mockResolvedValue({});
  atualizarUsuario.mockResolvedValue({});
});

describe('ChangePhoto', () => {
  it('sem foto mostra as iniciais e o botão de enviar desabilitado', () => {
    renderizar();

    expect(screen.getByRole('img', { name: 'Sem foto de perfil' })).toHaveTextContent('AS');
    expect(screen.getByRole('button', { name: 'Enviar foto' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Remover foto atual' })).not.toBeInTheDocument();
  });

  it('mostra a prévia reduzida, envia, atualiza o usuário e avisa na tela', async () => {
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderizar();

    await escolher(imagem());
    expect(screen.getByRole('img', { name: 'Prévia da foto de perfil' })).toHaveAttribute('src', FOTO_REDUZIDA);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Enviar foto' })));

    expect(atualizarFotoPerfil).toHaveBeenCalledWith(FOTO_REDUZIDA);
    expect(atualizarUsuario).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Foto de perfil atualizada!');
    expect(alerta).not.toHaveBeenCalled();
  });

  it('mostra o erro do backend sem perder a foto escolhida', async () => {
    atualizarFotoPerfil.mockRejectedValue(new Error('A foto é grande demais. Escolha uma imagem menor.'));
    renderizar();

    await escolher(imagem());
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Enviar foto' })));

    expect(screen.getByRole('alert')).toHaveTextContent('A foto é grande demais.');
    expect(screen.getByRole('button', { name: 'Enviar foto' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('recusa arquivos que não são imagem aceita ou grandes demais', async () => {
    renderizar();

    await escolher(imagem('application/pdf'));
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma imagem JPG, PNG ou WebP.');

    await escolher(imagem('image/jpeg', 16 * 1024 * 1024));
    expect(screen.getByRole('alert')).toHaveTextContent('no máximo 15 MB');

    expect(redimensionarFoto).not.toHaveBeenCalled();
  });

  it('avisa quando a imagem não pode ser lida e ignora seleção vazia', async () => {
    redimensionarFoto.mockRejectedValue(new Error('Não foi possível ler essa imagem.'));
    renderizar();

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Selecionar nova imagem'), { target: { files: [] } });
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await escolher(imagem());
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível ler essa imagem.');
  });

  it('com foto atual permite removê-la', async () => {
    renderizar({ nomeCompleto: 'Ana Souza', fotoPerfil: 'data:image/png;base64,ATUAL' });
    expect(screen.getByRole('img', { name: 'Prévia da foto de perfil' })).toHaveAttribute('src', 'data:image/png;base64,ATUAL');

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Remover foto atual' })));

    expect(atualizarFotoPerfil).toHaveBeenCalledWith(null);
    expect(screen.getByRole('status')).toHaveTextContent('Foto de perfil removida.');
  });
});
