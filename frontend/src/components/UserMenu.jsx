import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { iniciais } from '../utils/iniciais';
import './UserMenu.css';

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  // Perfil e Trocar foto abrem como modal por cima da tela atual (ver App.jsx).
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="user-menu">
      <button 
        className="user-menu__button" 
        onClick={toggleMenu} 
        aria-expanded={isOpen}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="Foto de perfil" className="user-menu__avatar" />
        ) : (
          <span className="user-menu__avatar user-menu__avatar--iniciais" aria-hidden="true">
            {iniciais(user?.name)}
          </span>
        )}
        {/* No botão só o primeiro nome; o nome completo aparece no menu aberto. */}
        <span className="user-menu__name">{user?.name?.split(' ')[0] || 'Usuário'}</span>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown">
          <div className="user-menu__info">
            <p className="user-menu__info-name">{user?.name}</p>
            <p className="user-menu__info-email">{user?.email}</p>
          </div>
          
          <ul className="user-menu__list">
            <li>
              <Link to="/profile" state={{ background: location }} className="user-menu__link" onClick={() => setIsOpen(false)}>
                Minha conta
              </Link>
            </li>
            <li>
              <Link to="/settings" state={{ background: location }} className="user-menu__link" onClick={() => setIsOpen(false)}>
                Trocar foto
              </Link>
            </li>
            
            <li className="user-menu__divider"></li>
            
            <li>
              <button 
                className="user-menu__link user-menu__link--logout" 
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
              >
                Sair
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}