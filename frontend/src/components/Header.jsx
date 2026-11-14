import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import UserMenu from './UserMenu';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

/**
 * Header — barra superior com sino de notificações e Entrar/Cadastrar
 * ou o Menu do Usuário, dependendo do estado de autenticação.
 */
export default function Header() {
  const { usuario, isAuthenticated, carregando, logout } = useAuth();
  const navigate = useNavigate();

  // Dados reais do usuário logado (antes era um usuário fixo de exemplo).
  const user = usuario && {
    name: usuario.nomeCompleto,
    email: usuario.email,
    avatar: usuario.fotoPerfil
  };

  // logout() avisa o backend e descarta o token; depois vai para o login.
  // `replace` evita que o "voltar" do navegador reabra a tela logada.
  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <button type="button" className="app-header__bell" aria-label="Notificações">
        <Bell size={20} aria-hidden="true" />
      </button>
      
      {/* Enquanto o /auth/me não responde, não mostra nem o menu nem
          "Entrar/Cadastrar", para não piscar a opção errada. */}
      {carregando ? null : isAuthenticated ? (
        <UserMenu user={user} onLogout={handleLogout} />
      ) : (
        <>
          <Link to="/login" className="app-header__btn app-header__btn--outline">Entrar</Link>
          <Link to="/cadastro" className="app-header__btn app-header__btn--filled">Cadastrar</Link>
        </>
      )}
    </header>
  );
}