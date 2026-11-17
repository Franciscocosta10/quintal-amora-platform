import { useState, useEffect, useCallback } from 'react';
import {
  CalendarHeart,
  CircleCheck,
  Clock,
  MapPin,
  PartyPopper,
  QrCode,
  ScanLine,
  UserCheck
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import QrScanner from '../../components/checkin/QrScanner';
import { registrarCheckin, consultarStatusCheckin, consultarHistoricoCheckins } from '../../services/checkinApi';
import { buscarEventoAtual } from '../../services/event';
import Layout from '../../components/Layout';
import './CheckIn.css';

const PASSOS = [
  { Icone: MapPin, titulo: 'Encontre um totem', texto: 'Procure o QR Code mais próximo no evento.' },
  { Icone: ScanLine, titulo: 'Escaneie o QR Code', texto: 'Aponte a câmera do celular e abra o link que aparecer.' },
  { Icone: UserCheck, titulo: 'Confirme seus dados', texto: 'Validamos sua entrada automaticamente.' },
  { Icone: PartyPopper, titulo: 'Pronto!', texto: 'Seu check-in fica registrado no histórico.' }
];

const MENSAGEM_QR_INVALIDO = 'Não foi possível validar esse QR Code. Tente novamente.';

/**
 * O QR do totem guarda um link para esta tela, com o código no `?qr=`:
 *   https://<site>/checkin?qr=checkin:evento:3:ponto:Entrada Principal
 * A câmera do celular abre o link e a tela faz o check-in sozinha.
 * Se o QR for lido pelo botão "Escanear QR Code" do app, o texto lido é
 * esse link inteiro: aqui tiramos só o código. Texto que não é link
 * (QR antigo, só com o código) passa direto.
 */
function extrairCodigoDoQr(textoLido) {
  try {
    return new URL(textoLido).searchParams.get('qr') ?? textoLido;
  } catch {
    return textoLido;
  }
}

function formatarHora(epoch) {
  return new Date(epoch).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarData(epoch) {
  return new Date(epoch).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export default function CheckIn() {
  const [aba, setAba] = useState('meu-checkin');
  // Evento atual (o mais recente cadastrado no Painel admin): o status do
  // check-in é sempre consultado para ele. undefined = ainda carregando.
  const [evento, setEvento] = useState(undefined);
  const [status, setStatus] = useState(null);
  const [escaneando, setEscaneando] = useState(false);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [erroHistorico, setErroHistorico] = useState(null);
  // Código do QR quando a tela foi aberta pelo link do totem (?qr=...).
  const [searchParams] = useSearchParams();
  const qrDoLink = searchParams.get('qr');

  // Recarrega o status depois de uma leitura de QR Code bem-sucedida.
  const carregarStatus = useCallback(async () => {
    if (!evento) return;

    try {
      const resultado = await consultarStatusCheckin(evento.id);
      setStatus(resultado);
      setErro(null);
    } catch {
      setErro('Não foi possível carregar seu status de check-in.');
    }
  }, [evento]);

  // Carga inicial, com os setState depois dos await (fora do corpo do
  // efeito) e ignorando as respostas se a tela já foi fechada.
  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      // Primeiro descobre o evento atual; sem evento cadastrado não há status.
      const eventoAtual = await buscarEventoAtual();
      if (cancelado) return;
      setEvento(eventoAtual);
      if (!eventoAtual) return;

      // Aberta pelo link do QR: registra o check-in antes de ver o status.
      // Se falhar, o status decide a mensagem: quem já tinha feito check-in
      // (ex: abriu o link de novo) só vê o "Check-in confirmado!".
      let falhouNoLink = false;
      if (qrDoLink) {
        try {
          await registrarCheckin(qrDoLink);
        } catch {
          falhouNoLink = true;
        }
      }

      const resultado = await consultarStatusCheckin(eventoAtual.id);
      if (cancelado) return;
      setStatus(resultado);
      if (falhouNoLink && !resultado.fezCheckin) setErro(MENSAGEM_QR_INVALIDO);
    }

    carregar()
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar seu status de check-in.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [qrDoLink]);

  const handleScan = useCallback(async (textoLido) => {
    setEscaneando(false);

    try {
      await registrarCheckin(extrairCodigoDoQr(textoLido));
      await carregarStatus();
    } catch {
      setErro(MENSAGEM_QR_INVALIDO);
    }
  }, [carregarStatus]);

  // O navegador só libera a câmera em conexão segura (https ou localhost).
  // No celular, abrindo pelo IP da rede (http://192.168...), cai aqui.
  const handleScannerError = useCallback(() => {
    setErro(
      window.isSecureContext
        ? 'Não foi possível acessar a câmera. Verifique se o navegador tem permissão para usá-la.'
        : 'Não foi possível acessar a câmera: o navegador só libera a câmera em sites com https.'
    );
  }, []);

  const carregarHistorico = useCallback(async () => {
    setCarregandoHistorico(true);

    try {
      const resultado = await consultarHistoricoCheckins();
      setHistorico(resultado.checkins || []);
      setErroHistorico(null);
    } catch {
      setErroHistorico('Não foi possível carregar seu histórico de check-ins.');
    } finally {
      setCarregandoHistorico(false);
    }
  }, []);

  const checkin = status?.checkin;

  return (
    <Layout>
      <div className="checkin-page">
        <header className="checkin-hero">
          <h1>Check-in fácil e rápido!</h1>
          <p>Escaneie o QR Code nos totens espalhados pelo evento para registrar sua presença.</p>
        </header>

        <nav className="checkin-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={aba === 'meu-checkin'}
            className={aba === 'meu-checkin' ? 'active' : ''}
            onClick={() => setAba('meu-checkin')}
          >
            Meu check-in
          </button>
          <button
            role="tab"
            aria-selected={aba === 'historico'}
            className={aba === 'historico' ? 'active' : ''}
            onClick={() => { setAba('historico'); carregarHistorico(); }}
          >
            Histórico
          </button>
        </nav>

        {aba === 'meu-checkin' && (
          <>
            {/* Card de status: muda de cor e conteúdo antes/depois do check-in. */}
            <section
              className={`checkin-status ${status?.fezCheckin ? 'checkin-status--feito' : ''}`}
              aria-live="polite"
            >
              <div className="checkin-evento">
                <CalendarHeart size={18} aria-hidden="true" />
                <span>Evento</span>
                <strong>{evento?.nome ?? 'Quintal da Amora'}</strong>
              </div>

              {carregando && <p className="checkin-status__texto">Carregando seu status…</p>}

              {!carregando && status?.fezCheckin && (
                <div className="checkin-status__corpo">
                  <span className="checkin-status__icone">
                    <CircleCheck size={36} aria-hidden="true" />
                  </span>
                  <h2>Check-in confirmado!</h2>
                  <p className="checkin-status__texto">Sua presença no evento está registrada.</p>

                  <div className="checkin-status__detalhes">
                    {checkin?.dataHoraEntrada && (
                      <span className="com-icone">
                        <Clock size="1em" aria-hidden="true" />
                        Entrada às {formatarHora(checkin.dataHoraEntrada)}
                      </span>
                    )}
                    {checkin?.pontoDeEntrada && (
                      <span className="com-icone">
                        <MapPin size="1em" aria-hidden="true" />
                        {checkin.pontoDeEntrada}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!carregando && !evento && !erro && (
                <p className="checkin-status__texto">
                  Nenhum evento cadastrado ainda. O check-in abre quando a organização cadastrar o evento.
                </p>
              )}

              {!carregando && evento && !status?.fezCheckin && (
                <div className="checkin-status__corpo">
                  {escaneando ? (
                    <>
                      <QrScanner onScan={handleScan} onError={handleScannerError} />
                      <button
                        type="button"
                        className="checkin-status__cancelar"
                        onClick={() => setEscaneando(false)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="checkin-status__icone">
                        <QrCode size={36} aria-hidden="true" />
                      </span>
                      <h2>Você ainda não fez check-in</h2>
                      <p className="checkin-status__texto">
                        Escaneie o QR Code de um dos totens para registrar sua entrada.
                      </p>
                      <button type="button" className="checkin-scan-btn" onClick={() => setEscaneando(true)}>
                        <ScanLine size={18} aria-hidden="true" />
                        Escanear QR Code
                      </button>
                    </>
                  )}
                </div>
              )}

              {erro && <p className="checkin-erro" role="alert">{erro}</p>}
            </section>

            <section className="checkin-card">
              <h2>Como funciona?</h2>
              <ol className="checkin-passos">
                {PASSOS.map(({ Icone, titulo, texto }, indice) => (
                  <li key={titulo} className="checkin-passo">
                    <span className="checkin-passo__icone">
                      <Icone size={22} aria-hidden="true" />
                      <span className="checkin-passo__numero">{indice + 1}</span>
                    </span>
                    <strong>{titulo}</strong>
                    <span>{texto}</span>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}

        {aba === 'historico' && (
          <section className="checkin-card">
            <h2>Histórico de check-ins</h2>

            {carregandoHistorico && <p className="checkin-card__texto">Carregando histórico…</p>}

            {erroHistorico && <p className="checkin-erro" role="alert">{erroHistorico}</p>}

            {!carregandoHistorico && !erroHistorico && historico.length === 0 && (
              <p className="checkin-card__texto">Você ainda não realizou nenhum check-in.</p>
            )}

            {!carregandoHistorico && !erroHistorico && historico.length > 0 && (
              // Linha do tempo: do check-in mais recente para o mais antigo
              // (o backend já devolve ordenado por dataHoraEntrada DESC).
              <ol className="checkin-timeline">
                {historico.map((item) => (
                  <li key={item.id} className="checkin-timeline__item">
                    <span className="checkin-timeline__marcador" aria-hidden="true">
                      <CircleCheck size={16} />
                    </span>
                    <div className="checkin-timeline__conteudo">
                      <span className="checkin-timeline__data">{formatarData(item.dataHoraEntrada)}</span>
                      <strong>{item.evento?.nome || `Evento #${item.evento}`}</strong>
                      <div className="checkin-timeline__detalhes">
                        <span className="com-icone">
                          <Clock size="1em" aria-hidden="true" />
                          {formatarHora(item.dataHoraEntrada)}
                        </span>
                        {item.pontoDeEntrada && (
                          <span className="com-icone">
                            <MapPin size="1em" aria-hidden="true" />
                            {item.pontoDeEntrada}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}
