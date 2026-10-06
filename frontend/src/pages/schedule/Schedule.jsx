import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import DayTabs from '../../components/schedule/DayTabs';
import ScheduleList from '../../components/schedule/ScheduleList';
import ScheduleForm from '../../components/schedule/ScheduleForm';
import { useAtividades } from '../../hooks/useSchedule';
import {
  criarAtividade,
  editarAtividade,
  removerAtividade
} from '../../services/Schedule';
import { buscarEventoAtual } from '../../services/Event';
import { useAuth } from '../../hooks/useAuth';
import { agruparPorDia } from '../../utils/agruparPorDia';
import './Schedule.css';

export default function Schedule() {
  const { isAdmin } = useAuth();

  const {
    atividades,
    carregando,
    erro
  } = useAtividades();

  const [eventoAtual, setEventoAtual] = useState(null);
  const [erroEvento, setErroEvento] = useState('');

  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [atividadeEditando, setAtividadeEditando] = useState(null);

  const { dias, porDia } = useMemo(
    () => agruparPorDia(atividades),
    [atividades]
  );

  useEffect(() => {
    let cancelado = false;

    async function carregarEventoAtual() {
      try {
        const evento = await buscarEventoAtual();

        if (!cancelado) {
          setEventoAtual(evento);
          setErroEvento('');
        }
      } catch (error) {
        if (!cancelado) {
          setErroEvento(
            error.message ||
            'Não foi possível identificar o evento atual.'
          );
        }
      }
    }

    carregarEventoAtual();

    return () => {
      cancelado = true;
    };
  }, []);

  const atividadesExibidas =
    diaSelecionado === null
      ? atividades
      : (porDia[diaSelecionado] || []);

  const destaques = useMemo(
  () =>
    atividadesExibidas.filter(
      (atividade) => atividade.destaque
    ),
  [atividadesExibidas]
);

  function abrirNovaAtividade() {
    setAtividadeEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(atividade) {
    setAtividadeEditando(atividade);
    setFormAberto(true);
  }

  function fecharFormulario() {
    setFormAberto(false);
    setAtividadeEditando(null);
  }

  async function salvarAtividade(dados) {
    if (atividadeEditando) {
      await editarAtividade(
        atividadeEditando.id,
        dados
      );
    } else {
      await criarAtividade(dados);
    }

    window.location.reload();
  }

  async function excluirAtividade(id) {
    await removerAtividade(id);
    fecharFormulario();
    window.location.reload();
  }

  return (
    <Layout
      rightRail={
        <div className="programacao-destaque">
  <h3>⭐ Destaques</h3>

  {destaques.length === 0 ? (
    <p className="programacao-destaque__vazio">
      Nenhum destaque marcado ainda.
    </p>
  ) : (
    <div className="programacao-destaque__lista">
      {destaques.map((atividade) => (
        <div
          key={atividade.id}
          className="programacao-destaque__item"
        >
          <strong>{atividade.titulo}</strong>

          {atividade.local && (
            <span>{atividade.local}</span>
          )}
        </div>
      ))}
    </div>
  )}
</div>
      }
    >
      <div className="programacao-header">
        <div className="programacao-header__top">
          <div>
            <h1>📅 Programação</h1>

            <p>
              Confira todos os horários, painéis,
              concursos, shows e atrações do
              Quintal da Amora. Escolha o dia e
              monte sua programação!
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="programacao__btn-adicionar"
              onClick={abrirNovaAtividade}
            >
              + Adicionar atividade
            </button>
          )}
        </div>
      </div>

      {erroEvento && isAdmin && (
        <div className="schedule-form__error">
          <span>!</span>
          <span>{erroEvento}</span>
        </div>
      )}

      <DayTabs
        dias={dias}
        diaSelecionado={diaSelecionado}
        onSelecionar={setDiaSelecionado}
      />

      {diaSelecionado === null ? (
  <div className="programacao-todos">
    {dias.map((dia) => (
      <section
        key={dia.chave}
        className="programacao-dia"
      >
        <h2 className="programacao-dia__titulo">
          {dia.rotulo}
        </h2>

        <ScheduleList
          atividades={porDia[dia.chave] || []}
          carregando={carregando}
          erro={erro}
          isAdmin={isAdmin}
          onEditar={abrirEdicao}
        />
      </section>
    ))}
  </div>
) : (
  <ScheduleList
    atividades={atividadesExibidas}
    carregando={carregando}
    erro={erro}
    isAdmin={isAdmin}
    onEditar={abrirEdicao}
  />
)}

      {formAberto && isAdmin && (
        <ScheduleForm
          atividadeInicial={atividadeEditando}
          eventoId={eventoAtual?.id}
          onSalvar={salvarAtividade}
          onExcluir={excluirAtividade}
          onCancelar={fecharFormulario}
        />
      )}
    </Layout>
  );
}