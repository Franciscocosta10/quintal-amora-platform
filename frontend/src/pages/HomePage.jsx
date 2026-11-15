import { Bell, CalendarDays, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Carrossel from '../components/home/Carrossel';
import ScheduleList from '../components/schedule/ScheduleList';
import { useAtividades } from '../hooks/useSchedule';
import { agruparPorDia } from '../utils/agruparPorDia';
import { buscarEventoAtual } from '../services/event';
import { useExpositores } from '../hooks/useExpositores';
import { rotuloDoTipo } from '../components/catalog/tiposExpositor';
import './HomePage.css';
import bannerAmoraLivros from '../assets/quintal/banner-amora-livros.png';
import cartaz13Edicao from '../assets/quintal/cartaz-13-edicao.webp';

// Para adicionar fotos: coloque o arquivo em src/assets/quintal/, importe acima e inclua aqui.
const FOTOS_QUINTAL = [
  { src: bannerAmoraLivros, alt: 'Ilustração da mascote da Amora Book Store dentro de um coração, cercada de livros e xícaras de chá' },
  { src: cartaz13Edicao, alt: 'Cartaz da 13ª edição do Quintal da Amora, o quintal mais otaku de Joinville' }
];

export default function HomePage() {
  const { atividades, carregando, erro } = useAtividades();
  const { expositores } = useExpositores();
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    buscarEventoAtual().then(setEvento).catch(() => setEvento(null));
  }, []);

  const previewAtividades = atividades.slice(0, 4);

  const { dias, porDia } = useMemo(
    () => agruparPorDia(previewAtividades),
    [previewAtividades]
  );

  return (
    <Layout
      rightRail={
        <>
          <div className="home-card">
            <h3 className="com-icone"><Bell size="1em" aria-hidden="true" /> Avisos Importantes</h3>
            <p className="home-card__placeholder">
              Em breve: alertas de check-in e chamadas para concursos (RF11/RF12).
            </p>
          </div>
          <div className="home-card">
            <h3 className="com-icone"><Store size="1em" aria-hidden="true" /> Lojas participantes</h3>
            {expositores.length === 0 ? (
              <p className="home-card__placeholder">
                O catálogo de lojas e artistas será divulgado em breve.
              </p>
            ) : (
              <ul className="home-expositores">
                {expositores.slice(0, 5).map((expositor) => (
                  <li key={expositor.id}>
                    <strong>{expositor.nome}</strong>
                    <span>{rotuloDoTipo(expositor.tipo)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/catalogo" className="home-card__link">
              Ver catálogo completo
            </Link>
          </div>
        </>
      }
    >
      <section className="home-destaque">
        <h1 className="apenas-leitor-de-tela">Quintal da Amora</h1>
        <Carrossel imagens={FOTOS_QUINTAL} rotulo="Fotos do Quintal da Amora" />
        {evento && (
          <div className="home-destaque__info">
            <span>{evento.data}</span>
            <span>{evento.horarioAbertura} {evento.horarioFechamento}</span>
            <span>{evento.local}</span>
          </div>
        )}
      </section>

      <section className="home-schedule">
        <div className="home-schedule__header">
          <h2 className="com-icone"><CalendarDays size="1em" aria-hidden="true" /> Cronograma de Atividades</h2>
        </div>

        {carregando || erro || previewAtividades.length === 0 ? (
          <ScheduleList
            atividades={previewAtividades}
            carregando={carregando}
            erro={erro}
          />
        ) : (
          <div className="home-schedule__dias">
            {dias.map((dia) => (
              <div key={dia.chave} className="home-schedule__dia">
                <h3 className="home-schedule__dia-titulo">{dia.rotulo}</h3>

                <ScheduleList
                  atividades={porDia[dia.chave] || []}
                  carregando={false}
                  erro={null}
                />
              </div>
            ))}
          </div>
        )}

        <Link to="/schedule" className="home-schedule__cta">
          Ver cronograma completo
        </Link>
      </section>
    </Layout>
  );
}