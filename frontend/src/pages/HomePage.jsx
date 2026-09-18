/**
 * pages/HomePage.jsx
 *
 * Placeholder temporário. Não fazia parte do pedido das 3 telas, mas
 * sem uma rota "/" o login não tem pra onde ir depois de autenticar.
 * Quando a Etapa 2 (Programação) começar, esta página vira o ponto de
 * entrada real do app logado.
 */

import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ScheduleList from '../components/schedule/ScheduleList';
import { useAtividades } from '../hooks/useSchedule';
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
          {/*
            Os nomes de campo abaixo (evento.data, evento.horarioAbertura, ...)
            são um CHUTE baseado no mockup — ajuste conforme os atributos reais
            do seu model Evento (ver nota em evento/find-atual.js).
          */}
          {evento && (
            <div className="home-banner__info">
              <span>📅 {evento.data}</span>
              <span>🕘 {evento.horarioAbertura} às {evento.horarioFechamento}</span>
              <span>📍 {evento.local}</span>
            </div>
          )}
        </section>
  
        <section className="home-schedule">
          <div className="home-schedule__header">
            <h2>📅 Cronograma de Atividades</h2>
          </div>
  
          <ScheduleList atividades={previewAtividades} carregando={carregando} erro={erro} />
  
          <Link to="/schedule" className="home-schedule__cta">
            Ver cronograma completo
          </Link>
        </section>
      </Layout>
    );
  }