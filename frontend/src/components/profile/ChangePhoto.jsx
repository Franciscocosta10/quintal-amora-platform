import { useState } from 'react';
import { Check, ImagePlus } from 'lucide-react';
import ModalPagina from '../ModalPagina';
import { useAuth } from '../../hooks/useAuth';
import { useFecharModalPagina } from '../../hooks/useFecharModalPagina';
import { atualizarFotoPerfil } from '../../services/perfil';
import { redimensionarFoto } from '../../utils/redimensionarFoto';
import { iniciais } from '../../utils/iniciais';
import './ChangePhoto.css';

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_MB = 15;

export default function ChangePhoto() {
  const { usuario, atualizarUsuario } = useAuth();
  const fechar = useFecharModalPagina();

  // Foto escolhida e já reduzida (data URL), ainda não enviada.
  const [novaFoto, setNovaFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const fotoExibida = novaFoto || usuario?.fotoPerfil;

  async function aoEscolherArquivo(evento) {
    const arquivo = evento.target.files[0];
    // Limpa o input para poder escolher o mesmo arquivo de novo.
    evento.target.value = '';
    if (!arquivo) return;

    setErro('');
    setSucesso('');

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErro('Escolha uma imagem JPG, PNG ou WebP.');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      setErro(`A imagem precisa ter no máximo ${TAMANHO_MAXIMO_MB} MB.`);
      return;
    }

    try {
      setNovaFoto(await redimensionarFoto(arquivo));
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function salvar(foto, mensagem) {
    setErro('');
    setSucesso('');
    setEnviando(true);

    try {
      await atualizarFotoPerfil(foto);
      await atualizarUsuario();
      setNovaFoto(null);
      setSucesso(mensagem);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  }

  function aoEnviar(evento) {
    evento.preventDefault();
    salvar(novaFoto, 'Foto de perfil atualizada!');
  }

  return (
    <ModalPagina titulo="Trocar foto" onFechar={fechar}>
      <div className="change-photo__container">
        <h1 className="change-photo__title">Trocar foto</h1>
        <p className="change-photo__subtitle">Escolha uma nova foto de perfil</p>

        {sucesso && (
          <div className="change-photo__sucesso" role="status">
            <span><Check size={13} strokeWidth={3} aria-hidden="true" /></span>
            <span>{sucesso}</span>
          </div>
        )}

        <div className="change-photo__preview-area">
          {fotoExibida ? (
            <img src={fotoExibida} alt="Prévia da foto de perfil" className="change-photo__avatar" />
          ) : (
            <span className="change-photo__avatar change-photo__avatar--iniciais" aria-label="Sem foto de perfil" role="img">
              {iniciais(usuario?.nomeCompleto)}
            </span>
          )}
        </div>

        <form className="change-photo__form" onSubmit={aoEnviar}>
          <label htmlFor="file-upload" className="change-photo__file-label com-icone">
            <ImagePlus size="1.1em" aria-hidden="true" />
            {novaFoto ? 'Escolher outra imagem' : 'Selecionar nova imagem'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept={TIPOS_ACEITOS.join(',')}
            className="change-photo__file-input"
            onChange={aoEscolherArquivo}
            disabled={enviando}
          />

          {erro && <p className="change-photo__erro" role="alert">{erro}</p>}

          <div className="change-photo__actions">
            <button type="submit" className="change-photo__btn change-photo__btn--save" disabled={!novaFoto || enviando}>
              {enviando ? 'Enviando…' : 'Enviar foto'}
            </button>
            <button type="button" className="change-photo__btn change-photo__btn--cancel" onClick={fechar}>
              Voltar
            </button>
          </div>

          {usuario?.fotoPerfil && !novaFoto && (
            <button
              type="button"
              className="change-photo__remover"
              onClick={() => salvar(null, 'Foto de perfil removida.')}
              disabled={enviando}
            >
              Remover foto atual
            </button>
          )}
        </form>
      </div>
    </ModalPagina>
  );
}
