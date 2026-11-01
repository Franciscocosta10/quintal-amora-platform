import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import DayTabs from '../../components/schedule/DayTabs';
import ContestList from '../../components/contest/ContestList';
import ContestForm from '../../components/contest/ContestForm';
import RegistrationConfirmedModal from '../../components/contest/RegistrationConfirmedModal';
import { useContests } from '../../hooks/useContests';
import { useMyRegistrations } from '../../hooks/useMyRegistrations';
import { useFavoriteContests } from '../../hooks/useFavoriteContests';
import { criarConcurso, editarConcurso, removerConcurso } from '../../services/Contest';
import { inscreverEmConcurso, cancelarInscricao } from '../../services/Registration';
import { buscarEventoAtual } from '../../services/Event';
import { useAuth } from '../../hooks/useAuth';
import { agruparPorCategoria } from '../../utils/agruparPorCategoria';
import { agruparPorDia } from '../../utils/agruparPorDia';
import './Contests.css';

export default function Contests() {
  const { isAdmin } = useAuth();

  const { concursos, carregando, erro } = useContests();
  const { inscricoes, recarregar: recarregarInscricoes } = useMyRegistrations();
  const { favoritos, alternarFavorito, ehFavorito } = useFavoriteContests();

  const [eventoAtual, setEventoAtual] = useState(null);
  const [erroEvento, setErroEvento] = useState('');
  const [erroInscricao, setErroInscricao] = useState('');

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [favoritosSelecionado, setFavoritosSelecionado] = useState(false);

  const [formAberto, setFormAberto] = useState(false);
  const [concursoEditando, setConcursoEditando] = useState(null);
  const [concursoInscrito, setConcursoInscrito] = useState(null);

  const { categorias, porCategoria } = useMemo(
    () => agruparPorCategoria(concursos),
    [concursos]
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
          setErroEvento(error.message || 'Não foi possível identificar o evento atual.');
        }
      }
    }

    carregarEventoAtual();

    return () => {
      cancelado = true;
    };
  }, []);

  function selecionarCategoria(chave) {
    setFavoritosSelecionado(false);
    setCategoriaSelecionada(chave);
  }

  function selecionarFavoritos() {
    setFavoritosSelecionado(true);
  }

  const concursosExibidos = favoritosSelecionado
    ? concursos.filter((c) => favoritos.includes(c.id))
    : categoriaSelecionada === null
      ? concursos
      : (porCategoria[categoriaSelecionada] || []);

  // Reaproveita o mesmo agrupamento por dia da Programação — Concurso
  // também tem `dataHoraInicio`, então o cabeçalho de data em cima do
  // card fica idêntico ao da tela de Programação.
  const { dias: diasDosConcursos, porDia: concursosPorDia } = useMemo(
    () => agruparPorDia(concursosExibidos),
    [concursosExibidos]
  );

  const destaques = useMemo(
    () => concursos.filter((c) => c.destaque),
    [concursos]
  );

  const minhasInscricoesPorConcurso = useMemo(() => {
    const mapa = {};

    inscricoes
      .filter((inscricao) => inscricao.status !== 'cancelado')
      .forEach((inscricao) => {
        const concursoId = inscricao.concurso?.id ?? inscricao.concurso;
        mapa[concursoId] = inscricao.id;
      });

    return mapa;
  }, [inscricoes]);

  function abrirNovoConcurso() {
    setConcursoEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(concurso) {
    setConcursoEditando(concurso);
    setFormAberto(true);
  }

  function fecharFormulario() {
    setFormAberto(false);
    setConcursoEditando(null);
  }

  async function salvarConcurso(dados) {
    if (concursoEditando) {
      await editarConcurso(concursoEditando.id, dados);
    } else {
      await criarConcurso(dados);
    }

    window.location.reload();
  }

  async function excluirConcurso(id) {
    await removerConcurso(id);
    fecharFormulario();
    window.location.reload();
  }

  async function alternarDestaque(concurso) {
    try {
      await editarConcurso(concurso.id, { destaque: !concurso.destaque });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao alterar destaque:', error);
    }
  }

  async function inscrever(concursoId) {
    setErroInscricao('');

    try {
      await inscreverEmConcurso(concursoId);
      await recarregarInscricoes();

      const concurso = concursos.find((c) => c.id === concursoId);
      setConcursoInscrito(concurso || null);
    } catch (error) {
      setErroInscricao(error.message || 'Não foi possível concluir a inscrição.');
    }
  }

  async function cancelar(inscricaoId) {
    setErroInscricao('');

    try {
      await cancelarInscricao(inscricaoId);
      await recarregarInscricoes();
    } catch (error) {
      setErroInscricao(error.message || 'Não foi possível cancelar a inscrição.');
    }
  }

  return (
    <Layout
      rightRail={
        <div className="contests-highlight">
          <h3>⭐ Destaques</h3>

          {destaques.length === 0 ? (
            <p className="contests-highlight__vazio">Nenhum destaque marcado ainda.</p>
          ) : (
            <div className="contests-highlight__lista">
              {destaques.map((concurso) => (
                <div key={concurso.id} className="contests-highlight__item">
                  <strong>{concurso.nome}</strong>
                  {concurso.categoria && <span>{concurso.categoria}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      }
    >
      <div className="contests-header">
        <div className="contests-header__top">
          <div>
            <h1>🏆 Concursos</h1>
            <p>
              Confira os concursos do Quintal da Amora, acompanhe datas e
              inscreva-se nos que quiser participar!
            </p>
          </div>

          {isAdmin && (
            <button type="button" className="contests__btn-adicionar" onClick={abrirNovoConcurso}>
              + Adicionar concurso
            </button>
          )}
        </div>
      </div>

      {erroEvento && isAdmin && (
        <div className="contest-form__error">
          <span>!</span>
          <span>{erroEvento}</span>
        </div>
      )}

      {erroInscricao && (
        <div className="contest-form__error">
          <span>!</span>
          <span>{erroInscricao}</span>
        </div>
      )}

      <DayTabs
        dias={categorias}
        diaSelecionado={categoriaSelecionada}
        onSelecionar={selecionarCategoria}
        favoritosSelecionado={favoritosSelecionado}
        onSelecionarFavoritos={selecionarFavoritos}
        isAdmin={isAdmin}
        temFavoritos={favoritos.length > 0}
      />

      {carregando || erro || concursosExibidos.length === 0 ? (
        <ContestList
          concursos={concursosExibidos}
          carregando={carregando}
          erro={erro}
          isAdmin={isAdmin}
          minhasInscricoesPorConcurso={minhasInscricoesPorConcurso}
          ehFavorito={ehFavorito}
          onEditar={abrirEdicao}
          onInscrever={inscrever}
          onCancelar={cancelar}
          onAlternarDestaque={alternarDestaque}
          onAlternarFavorito={alternarFavorito}
        />
      ) : (
        <div className="contests-todos">
          {diasDosConcursos.map((dia) => (
            <section key={dia.chave} className="contests-dia">
              <h2 className="contests-dia__titulo">{dia.rotulo}</h2>

              <ContestList
                concursos={concursosPorDia[dia.chave] || []}
                carregando={false}
                erro={null}
                isAdmin={isAdmin}
                minhasInscricoesPorConcurso={minhasInscricoesPorConcurso}
                ehFavorito={ehFavorito}
                onEditar={abrirEdicao}
                onInscrever={inscrever}
                onCancelar={cancelar}
                onAlternarDestaque={alternarDestaque}
                onAlternarFavorito={alternarFavorito}
              />
            </section>
          ))}
        </div>
      )}

      {formAberto && isAdmin && (
        <ContestForm
          concursoInicial={concursoEditando}
          eventoId={eventoAtual?.id}
          onSalvar={salvarConcurso}
          onExcluir={excluirConcurso}
          onCancelar={fecharFormulario}
        />
      )}

      <RegistrationConfirmedModal
        concurso={concursoInscrito}
        onFechar={() => setConcursoInscrito(null)}
      />
    </Layout>
  );
}