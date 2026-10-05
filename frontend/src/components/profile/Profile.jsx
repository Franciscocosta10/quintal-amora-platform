import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../lib/api';
import './Profile.css';

export default function Profile() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setMensagemSucesso('Dados do perfil atualizados com sucesso!');

    setTimeout(() => {
      setMensagemSucesso('');
    }, 3000);
  };

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
    <div className="profile">
      <div className="profile__container">

        <h1 className="profile__title">
          My Account
        </h1>

        <p className="profile__subtitle">
          Manage your personal information
        </p>

        {mensagemSucesso && (
          <div className="profile__success" role="status">
            <span>✓</span>
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
              Name
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
              Email
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

          <div className="profile__actions">
            <button
              type="submit"
              className="profile__btn profile__btn--save"
            >
              Save Changes
            </button>

            <Link
              to="/"
              className="profile__btn profile__btn--cancel"
            >
              Cancel
            </Link>
          </div>

          <Link
            to="/home"
            className="profile__home"
          >
            ← Voltar para a Home
          </Link>

        </form>
      </div>
    </div>
  );
}