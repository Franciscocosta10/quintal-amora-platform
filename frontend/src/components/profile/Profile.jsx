import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import ModalPagina from '../ModalPagina';
import { useAuth } from '../../hooks/useAuth';
import { useFecharModalPagina } from '../../hooks/useFecharModalPagina';
import { apiFetch } from '../../lib/api';
import { atualizarDadosPerfil } from '../../services/perfil';
import './Profile.css';

/**
 * Conteúdo do Perfil. Fica separado do modal para só ser montado depois
 * que o usuário logado carregou (ver `Profile` abaixo): o formulário
 * copia nome e e-mail para o estado na montagem, então, se montasse antes
 * do /auth/me responder (ex.: abrindo /profile direto pela URL), os
 * campos ficariam vazios.
 */
function ConteudoPerfil({ fechar }) {
  const {
    usuario,
    isAdmin,
    atualizarUsuario
  } = useAuth();

  const [formData, setFormData] = useState({
    name: usuario?.nomeCompleto || '',
    email: usuario?.email || ''
  });

  const [alterandoPerfil, setAlterandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroDados, setErroDados] = useState('');

  const semAlteracoes =
    formData.name.trim() === (usuario?.nomeCompleto || '') &&
    formData.email.trim().toLowerCase() === (usuario?.email || '').toLowerCase();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErroDados('');
    setMensagemSucesso('');
    setSalvando(true);

    try {
      await atualizarDadosPerfil({ nomeCompleto: formData.name, email: formData.email });
      // Recarrega o usuário para o header e o menu mostrarem o nome novo.
      await atualizarUsuario();
      setMensagemSucesso('Dados do perfil atualizados com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 3000);
    } catch (error) {
      setErroDados(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alternarPerfil() {
    setErroPerfil('');
    setMensagemSucesso('');
    setAlterandoPerfil(true);

    try {
      const novoPerfil = isAdmin
        ? 'visitante'
        : 'administrador';

      await apiFetch('/auth/change-profile', {
        method: 'PUT',
        body: {
          perfil: novoPerfil
        }
      });

      await atualizarUsuario();

      setMensagemSucesso(
        novoPerfil === 'administrador'
          ? 'Perfil alterado para Administrador com sucesso!'
          : 'Perfil alterado para Visitante com sucesso!'
      );

      setTimeout(() => {
        setMensagemSucesso('');
      }, 3000);

    } catch (error) {
      setErroPerfil(
        error.message || 'Não foi possível alterar o perfil.'
      );
    } finally {
      setAlterandoPerfil(false);
    }
  }

  return (
    <div className="profile__container">

      <h1 className="profile__title">
        Minha conta
      </h1>

      <p className="profile__subtitle">
        Gerencie suas informações pessoais
      </p>

      {mensagemSucesso && (
        <div className="profile__success" role="status">
          <span><Check size={13} strokeWidth={3} aria-hidden="true" /></span>
          <span>{mensagemSucesso}</span>
        </div>
      )}

      <form
        className="profile__form"
        onSubmit={handleSubmit}
      >
        <div className="profile__field">
          <label
            htmlFor="name"
            className="profile__label"
          >
            Nome
          </label>

          <input
            type="text"
            id="name"
            name="name"
            className="profile__input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="profile__field">
          <label
            htmlFor="email"
            className="profile__label"
          >
            E-mail
          </label>

          <input
            type="email"
            id="email"
            name="email"
            className="profile__input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="profile__profile-info">
          <span className="profile__profile-label">
            Perfil atual
          </span>

          <strong>
            {isAdmin ? 'Administrador' : 'Visitante'}
          </strong>
        </div>

        {import.meta.env.DEV && (
          <div className="profile__dev-section">
            <p className="profile__dev-title">
              Área de testes
            </p>

            <p className="profile__dev-description">
              Utilize este botão para testar as permissões
              de visitante e administrador.
            </p>

            <button
              type="button"
              className="profile__btn profile__btn--profile"
              onClick={alternarPerfil}
              disabled={alterandoPerfil}
            >
              {alterandoPerfil
                ? 'Alterando...'
                : isAdmin
                  ? 'Alternar para Visitante'
                  : 'Alternar para Administrador'}
            </button>

            {erroPerfil && (
              <p className="profile__error">
                {erroPerfil}
              </p>
            )}
          </div>
        )}

        {erroDados && (
          <p className="profile__error" role="alert">
            {erroDados}
          </p>
        )}

        <div className="profile__actions">
          <button
            type="submit"
            className="profile__btn profile__btn--save"
            disabled={salvando || semAlteracoes}
          >
            {salvando ? 'Salvando…' : 'Salvar alterações'}
          </button>

          <button
            type="button"
            className="profile__btn profile__btn--cancel"
            onClick={fechar}
          >
            Cancelar
          </button>
        </div>

        <Link
          to="/home"
          className="profile__home"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para a Home
        </Link>

      </form>
    </div>
  );
}

export default function Profile() {
  const { usuario, carregando } = useAuth();
  const fechar = useFecharModalPagina();

  return (
    <ModalPagina titulo="Minha conta" onFechar={fechar}>
      {carregando ? (
        <div className="profile__container">
          <p className="profile__subtitle">Carregando seus dados…</p>
        </div>
      ) : (
        // A key remonta o formulário se o usuário logado mudar.
        <ConteudoPerfil key={usuario?.id ?? 'sem-usuario'} fechar={fechar} />
      )}
    </ModalPagina>
  );
}