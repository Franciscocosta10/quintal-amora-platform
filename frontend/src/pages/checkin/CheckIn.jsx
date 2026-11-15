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
import QrScanner from '../../components/checkin/QrScanner';
import { registrarCheckin, consultarStatusCheckin, consultarHistoricoCheckins } from '../../services/checkinApi';
import Layout from '../../components/Layout';
import './CheckIn.css';

// TODO: substituir pela lógica real de "evento ativo no momento"
const EVENTO_ID_ATUAL = 1;
const NOME_EVENTO = 'Quintal da Amora';

const PASSOS = [
  { Icone: MapPin, titulo: 'Encontre um totem', texto: 'Procure o QR Code mais próximo no evento.' },
  { Icone: ScanLine, titulo: 'Escaneie o QR Code', texto: 'Toque em "Escanear QR Code" e aponte a câmera.' },
  { Icone: UserCheck, titulo: 'Confirme seus dados', texto: 'Validamos sua entrada automaticamente.' },
  { Icone: PartyPopper, titulo: 'Pronto!', texto: 'Seu check-in fica registrado no histórico.' }
];

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
  const [status, setStatus] = useState(null);
  const [escaneando, setEscaneando] = useState(false);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [erroHistorico, setErroHistorico] = useState(null);

  // Recarrega o status depois de uma leitura de QR Code bem-sucedida.
  const carregarStatus = useCallback(async () => {
    try {
      const resultado = await consultarStatusCheckin(EVENTO_ID_ATUAL);
      setStatus(resultado);
      setErro(null);
    } catch {
      setErro('Não foi possível carregar seu status de check-in.');
    }
  }, []);

  // Carga inicial com os setState dentro do .then (fora do corpo do efeito)
  // e ignorando a resposta se a tela já foi fechada.
  useEffect(() => {
    let cancelado = false;

    consultarStatusCheckin(EVENTO_ID_ATUAL)
      .then((resultado) => {
        if (!cancelado) setStatus(resultado);
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar seu status de check-in.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const handleScan = useCallback(async (qrCode) => {
    setEscaneando(false);

    try {
      await registrarCheckin(qrCode);
      await carregarStatus();
    } catch {
      setErro('Não foi possível validar esse QR Code. Tente novamente.');
    }
  }, [carregarStatus]);

  const handleScannerError = useCallback(() => {
    setErro('Não foi possível acessar a câmera.');
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
                <strong>{NOME_EVENTO}</strong>
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

              {!carregando && !status?.fezCheckin && (
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
