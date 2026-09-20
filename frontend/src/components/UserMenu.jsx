import { useState } from 'react';
import { Link } from 'react-router-dom';
import './UserMenu.css';

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="user-menu">
      <button 
        className="user-menu__button" 
        onClick={toggleMenu} 
        aria-expanded={isOpen}
      >
        <img
          src={user?.avatar || 'https://via.placeholder.com/40'}
          alt="User Profile"
          className="user-menu__avatar"
        />
        <span className="user-menu__name">{user?.name || 'User'}</span>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown">
          <div className="user-menu__info">
            <p className="user-menu__info-name">{user?.name}</p>
            <p className="user-menu__info-email">{user?.email}</p>
          </div>
          
          <ul className="user-menu__list">
            <li>
              <Link to="/profile" className="user-menu__link" onClick={() => setIsOpen(false)}>
                My Account
              </Link>
            </li>
            <li>
              <Link to="/settings" className="user-menu__link" onClick={() => setIsOpen(false)}>
                Change Photo
              </Link>
            </li>
            
            <li className="user-menu__divider"></li>
            
            <li>
              <button 
                className="user-menu__link user-menu__link--logout" 
                onClick={onLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}