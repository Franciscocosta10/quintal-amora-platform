import { useState, useEffect, useCallback } from 'react';
import QrScanner from '../../components/checkin/QrScanner';
import { registrarCheckin, consultarStatusCheckin, consultarHistoricoCheckins } from '../../services/checkinApi';
import './CheckIn.css';
import Layout from '../../components/Layout';

// TODO: substituir pela lógica real de "evento ativo no momento"
const EVENTO_ID_ATUAL = 1;

export default function CheckIn() {
  const [aba, setAba] = useState('meu-checkin');
  const [status, setStatus] = useState(null);
  const [escaneando, setEscaneando] = useState(false);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [erroHistorico, setErroHistorico] = useState(null);

  const carregarStatus = useCallback(async () => {
    try {
      const resultado = await consultarStatusCheckin(EVENTO_ID_ATUAL);
      setStatus(resultado);
      setErro(null);
    } catch {
      setErro('Não foi possível carregar seu status de check-in.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarStatus();
  }, [carregarStatus]);

  const handleScan = useCallback(async (qrCode) => {
  setEscaneando(false);

  try {
    await registrarCheckin(qrCode);
    await carregarStatus();
  } catch {
    setErro('Não foi possível validar esse QR Code. Tente novamente.');
  }
}, [carregarStatus]);

  const horarioCheckin = status?.checkin?.dataHoraEntrada
  ? new Date(status.checkin.dataHoraEntrada).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  : null;

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
            onClick={() => { setAba('historico'); carregarHistorico();}}
          >
            Histórico
          </button>
        </nav>

        {aba === 'meu-checkin' && (
          <section className="checkin-card">
            <h2>Faça seu check-in agora</h2>

            {carregando && <p>Carregando...</p>}

            {!carregando && status?.fezCheckin && (
              <p className="checkin-sucesso">
                ✓ Seu check-in foi validado com sucesso!{horarioCheckin ? ` (${horarioCheckin})` : ''}
              </p>
            )}

            {!carregando && !status?.fezCheckin && (
              <>
                {!escaneando ? (
                  <button className="checkin-scan-btn" onClick={() => setEscaneando(true)}>
                    Escanear QR Code
                  </button>
                ) : (
                  <QrScanner
                    onScan={handleScan}
                    onError={handleScannerError}
                  />
                )}
              </>
            )}

            {erro && <p className="checkin-erro">{erro}</p>}

            <div className="checkin-como-funciona">
              <h3>Como funciona?</h3>
              <ol>
                <li>Encontre o QR Code mais próximo no evento</li>
                <li>Escaneie o QR Code</li>
                <li>Confirme suas informações</li>
                <li>Check-in realizado com sucesso!</li>
              </ol>
            </div>
          </section>
        )}

        {aba === 'historico' && (
          <section className="checkin-card">
            <h2>Histórico de check-ins</h2>

            {carregandoHistorico && (
              <p>Carregando histórico...</p>
            )}

            {erroHistorico && (
              <p className="checkin-erro">
                {erroHistorico}
              </p>
            )}

            {!carregandoHistorico &&
              !erroHistorico &&
              historico.length === 0 && (
                <p>
                  Você ainda não realizou nenhum check-in.
                </p>
              )}

            {!carregandoHistorico &&
              !erroHistorico &&
              historico.length > 0 && (
                <div className="checkin-historico">
                  {historico.map((item) => (
                    <article
                      key={item.id}
                      className="checkin-historico-item"
                    >
                      <h3>
                        {item.evento?.nome || `Evento #${item.evento}`}
                      </h3>

                      {item.evento?.edicao && (
                        <p>
                          Edição: {item.evento.edicao}
                        </p>
                      )}

                      <p>
                        Entrada:{' '}
                        {new Date(
                          item.dataHoraEntrada
                        ).toLocaleString('pt-BR')}
                      </p>

                      {item.pontoDeEntrada && (
                        <p>
                          Local: {item.pontoDeEntrada}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
          </section>
        )}
      </div>
    </Layout>
  );
}
