import { useMemo, useState } from 'react';
import Layout from "../../components/Layout";
import DayTabs from "../../components/schedule/DayTabs";
import ScheduleList from "../../components/schedule/ScheduleList";
import ScheduleItem from "../../components/schedule/ScheduleItem";
import { useAtividades } from "../../hooks/useSchedule";
import { agruparPorDia } from '../../utils/agruparPorDia';
import './Schedule.css';

/**
 * Schedule.jsx — RF06: "O sistema deve exibir a programação completa
 * do evento".
 *
 * Estrutura da página, seguindo o mockup enviado:
 *  - cabeçalho com título e banner
 *  - abas "Todos / Sábado / Domingo" (calculadas a partir dos dados, não
 *    fixas no código — se o evento durar 3 dias, aparecem 3 abas)
 *  - lista de atividades do dia selecionado
 *  - coluna direita "Destaque do dia" com as atividades marcadas como
 *    `destaque` (RF07 permite o admin marcar isso)
 */
export default function Schedule() {
  const { atividades, carregando, erro } = useAtividades();
  const [diaSelecionado, setDiaSelecionado] = useState(null); // null = "Todos"

  const { dias, porDia } = useMemo(() => agruparPorDia(atividades), [atividades]);

  const atividadesExibidas = diaSelecionado === null
    ? atividades
    : (porDia[diaSelecionado] || []);

  const destaques = useMemo(
    () => atividadesExibidas.filter((a) => a.destaque).slice(0, 3),
    [atividadesExibidas]
  );

  return (
    <Layout
      rightRail={
        <div className="programacao-destaque">
          <h3>⭐ Destaque do dia</h3>
          {destaques.length === 0 ? (
            <p className="programacao-destaque__vazio">Nenhum destaque marcado ainda.</p>
          ) : (
            destaques.map((atividade) => (
              <ScheduleItem key={atividade.id} atividade={atividade} />
            ))
          )}
        </div>
      }
    >
      <div className="programacao-header">
        <h1>📅 Programação</h1>
        <p>Confira todos os horários, painéis, concursos, shows e atrações do Quintal da Amora. Escolha o dia e monte sua programação!</p>
      </div>

      <DayTabs dias={dias} diaSelecionado={diaSelecionado} onSelecionar={setDiaSelecionado} />

      <ScheduleList atividades={atividadesExibidas} carregando={carregando} erro={erro} />
    </Layout>
  );
}
