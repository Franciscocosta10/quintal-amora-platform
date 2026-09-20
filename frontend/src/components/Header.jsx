import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import './Header.css';

/**
 * Header — barra superior com sino de notificações e Entrar/Cadastrar
 * ou o Menu do Usuário, dependendo do estado de autenticação.
 */
export default function Header() {
  // Simulando a lógica de autenticação. 
  // Substituir a linha abaixo por: const { isAuthenticated, user, logout } = useAuth();
  // ATENÇÃO: Valor mockado como 'true' temporariamente apenas para desenvolvimento visual da tela.
  const isAuthenticated = true; 
  const userMock = {
    name: 'Visitante Geek',
    email: 'visitante@email.com',
    avatar: 'https://i.pravatar.cc/150?img=47' // Placeholder de imagem
  };

  const handleLogout = () => {
    // Lógica para limpar o JWT e deslogar
    console.log('Realizando logout...');
  };

  return (
    <header className="app-header">
      <button type="button" className="app-header__bell" aria-label="Notificações">🔔</button>
      
      {isAuthenticated ? (
        <UserMenu user={userMock} onLogout={handleLogout} />
      ) : (
        <>
          <Link to="/login" className="app-header__btn app-header__btn--outline">Entrar</Link>
          <Link to="/cadastro" className="app-header__btn app-header__btn--filled">Cadastrar</Link>
        </>
      )}
    </header>
  );
}