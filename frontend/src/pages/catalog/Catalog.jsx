import { useEffect, useMemo, useRef, useState } from 'react';
import { Store } from 'lucide-react';
import Layout from '../../components/Layout';
import DayTabs from '../../components/schedule/DayTabs';
import Pagination from '../../components/Pagination';
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

// 12 divide bem as colunas mais comuns do grid (2, 3, 4 ou 6 por linha).
const EXPOSITORES_POR_PAGINA = 12;

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
  const [pagina, setPagina] = useState(1);
  const filtrosRef = useRef(null);

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

  // A paginação é feita no navegador: o catálogo de um evento tem dezenas
  // de expositores, não milhares, e a lista completa já vem do backend
  // (a busca e as abas também filtram aqui). A página é limitada ao total
  // para não ficar "na página 3 de 2" depois de uma exclusão.
  const totalPaginas = Math.max(1, Math.ceil(expositoresExibidos.length / EXPOSITORES_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const expositoresDaPagina = expositoresExibidos.slice(
    (paginaAtual - 1) * EXPOSITORES_POR_PAGINA,
    paginaAtual * EXPOSITORES_POR_PAGINA
  );

  // Trocar de filtro sempre volta para a primeira página.
  function selecionarTipo(tipo) {
    setTipoSelecionado(tipo);
    setPagina(1);
  }

  function alterarBusca(texto) {
    setBusca(texto);
    setPagina(1);
  }

  // Ao trocar de página, volta para o topo da lista (os filtros), senão o
  // usuário continuaria olhando o rodapé da página nova.
  function mudarPagina(novaPagina) {
    setPagina(novaPagina);
    filtrosRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }

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
            <h1 className="com-icone"><Store size="1em" aria-hidden="true" /> Lojas & Influenciadores</h1>
            <p>
              Conheça as lojas e os artistas participantes do Quintal da Amora.
              Clique em um expositor para ver os detalhes.
            </p>
          </div>
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

      <div className="filtros-linha" ref={filtrosRef}>
        <DayTabs
          dias={ABAS_TIPO}
          diaSelecionado={tipoSelecionado}
          onSelecionar={selecionarTipo}
        />

        <input
          type="search"
          className="catalog-filtros__busca filtros-linha__direita"
          value={busca}
          onChange={(event) => alterarBusca(event.target.value)}
          placeholder="Buscar por nome..."
          aria-label="Buscar expositor por nome"
        />

        {/* Busca + botão ficam juntos à direita, alinhados com a última coluna do grid. */}
        {isAdmin && (
          <button type="button" className="contests__btn-adicionar" onClick={abrirNovoExpositor}>
            + Adicionar expositor
          </button>
        )}
      </div>

      <ExpositorGrid
        expositores={expositoresDaPagina}
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

      {!carregando && !erro && (
        <Pagination
          className="catalog-paginacao"
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          onMudarPagina={mudarPagina}
        />
      )}

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
