import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logoAmora from '../assets/quintal/logo-amora.webp';
import './Sidebar.css';

/**
 * Sidebar — navegação lateral fixa. No desktop fica sempre aberta; até
 * 1024px vira uma barra fina com o botão ☰, que abre e fecha os links.
 */
const ITENS_MENU = [
  { label: 'Início', to: '/home' },
  { label: 'Check-in', to: '/checkin' },
  { label: 'Programação', to: '/schedule' },
  { label: 'Concursos', to: '/concursos' },
  { label: 'Lojas & Influenciadores', to: '/catalogo' }
];

// Só aparece para administradores (RNF07).
const ITEM_ADMIN = { label: 'Painel admin', to: '/admin' };

// Não precisa fechar o menu ao trocar de página: cada página monta o
// próprio Layout, então a Sidebar nasce de novo com o menu fechado.
export default function Sidebar() {
  const { isAdmin } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const itens = isAdmin ? [...ITENS_MENU, ITEM_ADMIN] : ITENS_MENU;

  return (
    <aside className={`sidebar ${menuAberto ? 'sidebar--aberta' : ''}`}>
      <div className="sidebar__topo">
        <div className="sidebar__logo">
          <img src={logoAmora} alt="" className="sidebar__logo-imagem" />
          <span>Quintal<br />da Amora</span>
        </div>
        <button
          type="button"
          className="sidebar__menu-btn"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          aria-controls="sidebar-nav"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          {menuAberto ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>
      <nav id="sidebar-nav" className="sidebar__nav">
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
