import { useEffect, useState } from 'react';
import { ClipboardList, X } from 'lucide-react';
import {
  cancelarInscricao,
  listarInscritosDoConcurso,
  marcarPresenca
} from '../../services/Registration';
import './RegistrationsModal.css';

/**
 * Lista de participantes de um concurso (RF10) — só para o admin.
 *
 * Uso no dia do evento: a organização chama os inscritos na ordem de
 * inscrição, marca quem compareceu ("Presente") e pode remover uma
 * inscrição (vira "cancelado", libera a vaga e some da lista).
 *
 * `onFechar(houveRemocao)`: avisa a tela de Concursos se o total de
 * inscritos mudou, para ela atualizar o contador do card.
 */

function formatarDataHora(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

// Remontado a cada concurso (key no pai), então o estado começa limpo.
function ListaDeInscritos({ concurso, onFechar }) {
  const [inscricoes, setInscricoes] = useState(null);
  const [erro, setErro] = useState('');
  const [alterandoId, setAlterandoId] = useState(null);
  const [houveRemocao, setHouveRemocao] = useState(false);

  useEffect(() => {
    let cancelado = false;

    listarInscritosDoConcurso(concurso.id)
      .then((lista) => {
        if (!cancelado) setInscricoes(lista.filter((inscricao) => inscricao.status !== 'cancelado'));
      })
      .catch((error) => {
        if (!cancelado) setErro(error.message || 'Não foi possível carregar os inscritos.');
      });

    return () => {
      cancelado = true;
    };
  }, [concurso.id]);

  useEffect(() => {
    function aoApertarTecla(event) {
      if (event.key === 'Escape') onFechar(houveRemocao);
    }
    document.addEventListener('keydown', aoApertarTecla);
    return () => document.removeEventListener('keydown', aoApertarTecla);
  }, [onFechar, houveRemocao]);

  async function executar(inscricao, acao) {
    setErro('');
    setAlterandoId(inscricao.id);
    try {
      await acao();
    } catch (error) {
      setErro(error.message || 'Não foi possível atualizar a inscrição.');
    } finally {
      setAlterandoId(null);
    }
  }

  function alternarPresenca(inscricao) {
    return executar(inscricao, async () => {
      const atualizada = await marcarPresenca(inscricao.id, !inscricao.presencaConfirmada);
      setInscricoes((lista) => lista.map((item) => (
        item.id === inscricao.id ? { ...item, presencaConfirmada: atualizada.presencaConfirmada } : item
      )));
    });
  }

  function remover(inscricao) {
    return executar(inscricao, async () => {
      await cancelarInscricao(inscricao.id);
      setInscricoes((lista) => lista.filter((item) => item.id !== inscricao.id));
      setHouveRemocao(true);
    });
  }

  const presentes = inscricoes?.filter((inscricao) => inscricao.presencaConfirmada).length ?? 0;

  return (
    <div className="inscritos-overlay" onClick={() => onFechar(houveRemocao)}>
      <div
        className="inscritos-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inscritos-titulo"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="inscritos-modal__topo">
          <div>
            <h2 id="inscritos-titulo" className="com-icone">
              <ClipboardList size="1em" aria-hidden="true" /> Inscritos
            </h2>
            <p className="inscritos-modal__concurso">{concurso.nome}</p>
          </div>
          <button
            type="button"
            className="inscritos-modal__fechar"
            aria-label="Fechar"
            onClick={() => onFechar(houveRemocao)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {erro && (
          <div className="contest-form__error" role="alert">
            <span>!</span>
            <span>{erro}</span>
          </div>
        )}

        {!inscricoes && !erro && <p className="inscritos-modal__vazio">Carregando inscritos...</p>}

        {inscricoes && (
          <>
            <p className="inscritos-modal__resumo">
              {inscricoes.length} inscrito(s)
              {concurso.limiteParticipantes ? ` de ${concurso.limiteParticipantes} vagas` : ''}
              {' · '}
              {presentes} presente(s)
            </p>

            {inscricoes.length === 0 ? (
              <p className="inscritos-modal__vazio">Ninguém se inscreveu neste concurso ainda.</p>
            ) : (
              <ol className="inscritos-lista">
                {inscricoes.map((inscricao, indice) => {
                  const ocupado = alterandoId === inscricao.id;

                  return (
                    <li key={inscricao.id} className="inscritos-lista__item">
                      <span className="inscritos-lista__ordem">{indice + 1}</span>

                      <span className="inscritos-lista__texto">
                        <strong>{inscricao.usuario?.nomeCompleto ?? 'Usuário removido'}</strong>
                        <span>
                          {inscricao.usuario?.email}
                          {inscricao.usuario?.email && ' · '}
                          inscrito em {formatarDataHora(inscricao.createdAt)}
                        </span>
                      </span>

                      <label className="inscritos-lista__presenca">
                        <input
                          type="checkbox"
                          checked={Boolean(inscricao.presencaConfirmada)}
                          disabled={ocupado}
                          onChange={() => alternarPresenca(inscricao)}
                        />
                        Presente
                      </label>

                      <button
                        type="button"
                        className="inscritos-lista__remover"
                        disabled={ocupado}
                        onClick={() => remover(inscricao)}
                      >
                        Remover
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function RegistrationsModal({ concurso, onFechar }) {
  if (!concurso) return null;
  return <ListaDeInscritos key={concurso.id} concurso={concurso} onFechar={onFechar} />;
}
