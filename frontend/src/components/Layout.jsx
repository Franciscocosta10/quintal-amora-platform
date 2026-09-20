import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

/**
 * Layout — casca comum a todas as páginas autenticadas/públicas:
 * sidebar fixa à esquerda, header no topo, conteúdo principal no centro
 * e uma coluna direita opcional (usada pela Home para "Avisos" e
 * "Lojas participantes", e pela Programação para "Destaque do dia").
 *
 * Extraído para cá em vez de repetir em cada página, seguindo o mesmo
 * raciocínio de reuso do ScheduleList/ScheduleItem.
 */
export default function Layout({ children, rightRail }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__body">
        <Header />
        <div className="layout__content-wrapper">
          <main className="layout__main">{children}</main>
          {rightRail && <aside className="layout__right-rail">{rightRail}</aside>}
        </div>
      </div>
    </div>
  );
}
