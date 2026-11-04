import { useAuth } from '../hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ScheduleList from '../components/schedule/ScheduleList';
import { useAtividades } from '../hooks/useSchedule';
import { agruparPorDia } from '../utils/agruparPorDia';
import { buscarEventoAtual } from '../services/event';
import './HomePage.css';

export default function HomePage() {
  const { usuario, logout } = useAuth();
  const { atividades, carregando, erro } = useAtividades();
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
            <h3>🔔 Avisos Importantes</h3>
            <p className="home-card__placeholder">
              Em breve: alertas de check-in e chamadas para concursos (RF11/RF12).
            </p>
          </div>
          <div className="home-card">
            <h3>🏪 Lojas participantes</h3>
            <p className="home-card__placeholder">
              Em breve: catálogo de expositores (RF13/RF14).
            </p>
          </div>
        </>
      }
    >
      <section className="home-banner">
        <h1>QUINTAL DA AMORA</h1>
        <p>Cultura geek e otaku em Joinville</p>
        {evento && (
          <div className="home-banner__info">
            <span> {evento.data}</span>
            <span> {evento.horarioAbertura} {evento.horarioFechamento}</span>
            <span> {evento.local}</span>
          </div>
        )}
      </section>

      <section className="home-schedule">
        <div className="home-schedule__header">
          <h2>📅 Cronograma de Atividades</h2>
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