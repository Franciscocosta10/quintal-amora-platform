import { Link } from 'react-router-dom';
import './Header.css';

/**
 * Header — barra superior com sino de notificações e Entrar/Cadastrar.
 * Os botões hoje só linkam para /login e /cadastro; a lógica de "usuário
 * já logado -> mostrar avatar" pertence à tela de autenticação já
 * implementada (RF01-RF03) e não foi mexida aqui.
 */
export default function Header() {
  return (
    <header className="app-header">
      <button type="button" className="app-header__bell" aria-label="Notificações">🔔</button>
      <Link to="/login" className="app-header__btn app-header__btn--outline">Entrar</Link>
      <Link to="/cadastro" className="app-header__btn app-header__btn--filled">Cadastrar</Link>
    </header>
  );
}
