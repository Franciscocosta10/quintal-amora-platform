import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

/**
 * Sidebar — navegação lateral fixa (ver mockup: Início, Concursos,
 * Check-in, Favoritos, Login/Cadastro).
 *
 * Só "Início" e "Check-in" têm rota real até agora (Check-in já existe
 * das etapas anteriores). "Concursos" e "Favoritos" ainda não têm
 * funcionalidade (RF08-RF10 e a futura feature de favoritos), então
 * apontam para rotas que ainda não existem — troque o `to` quando essas
 * telas forem criadas, ou me avise para eu já deixar como "em breve".
 */
const ITENS_MENU = [
  { label: 'Início', to: '/home' },
  { label: 'Concursos', to: '/concursos' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Check-in', to: '/checkin' },
  { label: 'Programação', to: '/schedule' }
];

// Só aparece para administradores (RNF07).
const ITEM_ADMIN = { label: 'Painel admin', to: '/admin' };

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const itens = isAdmin ? [...ITENS_MENU, ITEM_ADMIN] : ITENS_MENU;

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">Quintal<br />Amora</div>
      <nav className="sidebar__nav">
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
