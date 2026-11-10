import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import DayTabs from '../../components/schedule/DayTabs';
import ExpositorGrid from '../../components/catalog/ExpositorGrid';
import ExpositorDetailModal from '../../components/catalog/ExpositorDetailModal';
import ExpositorForm from '../../components/catalog/ExpositorForm';
import { TIPOS_EXPOSITOR } from '../../components/catalog/tiposExpositor';
import { useExpositores } from '../../hooks/useExpositores';
import { criarExpositor, editarExpositor, removerExpositor } from '../../services/Expositor';
import { buscarEventoAtual } from '../../services/event';
import { useAuth } from '../../hooks/useAuth';
import '../contest/Contests.css';
import './Catalog.css';

// As abas reaproveitam o DayTabs (como Concursos faz com categorias).
// Ficam fixas — Lojas e Artistas sempre aparecem, mesmo vazias — para o
// visitante saber que as duas categorias existem.
const ABAS_TIPO = Object.entries(TIPOS_EXPOSITOR).map(([chave, tipo]) => ({
  chave,
  rotulo: tipo.plural
}));

// Busca sem diferenciar maiúsculas nem acentos: "atelie" encontra "Ateliê".
function normalizarBusca(texto = '') {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export default function Catalog() {
  const { isAdmin } = useAuth();
  const { expositores, carregando, erro, recarregar } = useExpositores();

  const [eventoAtual, setEventoAtual] = useState(null);
  const [erroEvento, setErroEvento] = useState('');

  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');

  const [expositorAberto, setExpositorAberto] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [expositorEditando, setExpositorEditando] = useState(null);
  const [aviso, setAviso] = useState('');

  // O evento atual só é necessário para o admin cadastrar (campo `evento`
  // obrigatório no backend) — mesmo fluxo da tela de Concursos.
  useEffect(() => {
    let cancelado = false;

    buscarEventoAtual()
      .then((evento) => {
        if (!cancelado) setEventoAtual(evento);
      })
      .catch((error) => {
        if (!cancelado) {
          setErroEvento(error.message || 'Não foi possível identificar o evento atual.');
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const expositoresExibidos = useMemo(() => {
    const termo = normalizarBusca(busca);

    return expositores.filter((expositor) => {
      if (tipoSelecionado && expositor.tipo !== tipoSelecionado) return false;
      if (termo && !normalizarBusca(expositor.nome).includes(termo)) return false;
      return true;
    });
  }, [expositores, tipoSelecionado, busca]);

  const filtrando = Boolean(tipoSelecionado || busca.trim());

  function abrirNovoExpositor() {
    setAviso('');
    setExpositorEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(expositor) {
    setAviso('');
    setExpositorAberto(null);
    setExpositorEditando(expositor);
    setFormAberto(true);
  }

  function fecharFormulario() {
    setFormAberto(false);
    setExpositorEditando(null);
  }

  // Erros sobem para o formulário (ele mostra a mensagem do backend);
  // em caso de sucesso a lista é recarregada sem reload da página.
  async function salvarExpositor(dados) {
    if (expositorEditando) {
      await editarExpositor(expositorEditando.id, dados);
    } else {
      await criarExpositor(dados);
    }

    await recarregar();
    setAviso(expositorEditando ? 'Expositor atualizado com sucesso!' : 'Expositor adicionado ao catálogo!');
    fecharFormulario();
  }

  async function excluirExpositor(id) {
    await removerExpositor(id);
    await recarregar();
    setAviso('Expositor excluído do catálogo.');
    fecharFormulario();
  }

  return (
    <Layout>
      <div className="contests-header">
        <div className="contests-header__top">
          <div>
            <h1>🏪 Catálogo</h1>
            <p>
              Conheça as lojas e os artistas participantes do Quintal da Amora.
              Clique em um expositor para ver os detalhes.
            </p>
          </div>

          {isAdmin && (
            <button type="button" className="contests__btn-adicionar" onClick={abrirNovoExpositor}>
              + Adicionar expositor
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

      {aviso && (
        <div className="contest-form__success" role="status">
          <span>✓</span>
          <span>{aviso}</span>
        </div>
      )}

      <div className="catalog-filtros">
        <DayTabs
          dias={ABAS_TIPO}
          diaSelecionado={tipoSelecionado}
          onSelecionar={setTipoSelecionado}
        />

        <input
          type="search"
          className="catalog-filtros__busca"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por nome..."
          aria-label="Buscar expositor por nome"
        />
      </div>

      <ExpositorGrid
        expositores={expositoresExibidos}
        carregando={carregando}
        erro={erro}
        mensagemVazio={
          filtrando
            ? 'Nenhum expositor encontrado para este filtro.'
            : 'Nenhum expositor cadastrado ainda.'
        }
        isAdmin={isAdmin}
        onAbrir={setExpositorAberto}
        onEditar={abrirEdicao}
      />

      <ExpositorDetailModal
        expositor={expositorAberto}
        isAdmin={isAdmin}
        onFechar={() => setExpositorAberto(null)}
        onEditar={abrirEdicao}
      />

      {formAberto && isAdmin && (
        <ExpositorForm
          expositorInicial={expositorEditando}
          eventoId={eventoAtual?.id}
          onSalvar={salvarExpositor}
          onExcluir={excluirExpositor}
          onCancelar={fecharFormulario}
        />
      )}
    </Layout>
  );
}
