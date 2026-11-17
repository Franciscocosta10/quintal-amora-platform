import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCog,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  QrCode,
  Store,
  Trophy,
  Users
} from 'lucide-react';
import Layout from '../../components/Layout';
import EventForm from '../../components/admin/EventForm';
import NotificationForm from '../../components/admin/NotificationForm';
import { buscarPainelAdmin } from '../../services/Admin';
import '../contest/Contests.css';
import '../../components/contest/ContestForm.css';
import './AdminDashboard.css';

/**
 * Painel administrativo (RF16) — versão simplificada da "Central de
 * Gerenciamento" do mockup: só leitura dos dados gerais do evento.
 * Cada cartão leva para a tela onde aquele dado já é gerenciado, então o
 * painel não duplica cadastro/edição de nada.
 */

const CARTOES = [
  { chave: 'participantes', rotulo: 'Participantes cadastrados', Icone: Users, to: '/admin/usuarios' },
  { chave: 'checkins', rotulo: 'Check-ins realizados', Icone: QrCode, to: '/checkin' },
  { chave: 'atividades', rotulo: 'Atividades programadas', Icone: CalendarDays, to: '/schedule' },
  { chave: 'concursosAbertos', rotulo: 'Concursos abertos', Icone: Trophy, to: '/concursos' },
  { chave: 'inscricoes', rotulo: 'Inscrições em concursos', Icone: ClipboardList, to: '/concursos' },
  { chave: 'expositores', rotulo: 'Lojas e artistas', Icone: Store, to: '/catalogo' }
];

const PERFIS = {
  visitante: 'Participante',
  administrador: 'Administrador'
};

function formatarData(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(timestamp));
}

function formatarDataHora(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

function Cartao({ rotulo, Icone, valor, to }) {
  const conteudo = (
    <>
      <Icone className="admin-cartao__icone" size="1em" aria-hidden="true" />
      <span className="admin-cartao__valor">{valor.toLocaleString('pt-BR')}</span>
      <span className="admin-cartao__rotulo">{rotulo}</span>
    </>
  );

  return to ? (
    <Link to={to} className="admin-cartao admin-cartao--link">{conteudo}</Link>
  ) : (
    <div className="admin-cartao">{conteudo}</div>
  );
}

export default function AdminDashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Nenhum setState síncrono aqui (regra react-hooks/set-state-in-effect,
  // mesmo padrão do useExpositores): o erro só é limpo quando a nova
  // resposta chega, e os dados antigos ficam na tela enquanto isso.
  const carregar = useCallback(() => {
    return buscarPainelAdmin()
      .then((resultado) => {
        setDados(resultado);
        setErro('');
      })
      .catch((error) => setErro(error.message || 'Não foi possível carregar o painel.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function atualizar() {
    setCarregando(true);
    carregar();
  }

  const evento = dados?.evento;

  return (
    <Layout>
      <div className="contests-header">
        <div className="contests-header__top">
          <div>
            <h1 className="com-icone"><LayoutDashboard size="1em" aria-hidden="true" /> Painel administrativo</h1>
            <p>
              {evento
                ? `Resumo de ${evento.nome} (${formatarData(evento.dataHoraInicio)} a ${formatarData(evento.dataHoraFim)}).`
                : 'Acompanhe aqui os números gerais do Quintal da Amora.'}
            </p>
          </div>
          <button
            type="button"
            className="contests__btn-adicionar"
            onClick={atualizar}
            disabled={carregando}
          >
            {carregando ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {erro && (
        <div className="contest-form__error" role="alert">
          <span>!</span>
          <span>{erro}</span>
        </div>
      )}

      {!erro && dados && !evento && (
        <p className="admin-aviso">
          Nenhum evento cadastrado ainda. Cadastre em "Dados do evento" logo abaixo para
          liberar o check-in e mostrar data e local na Home.
        </p>
      )}

      {carregando && !dados && <p className="admin-aviso">Carregando painel...</p>}

      {dados && (
        <>
          <section className="admin-cartoes" aria-label="Totais do evento">
            {CARTOES.map((cartao) => (
              <Cartao
                key={cartao.chave}
                rotulo={cartao.rotulo}
                Icone={cartao.Icone}
                to={cartao.to}
                valor={dados.totais[cartao.chave] ?? 0}
              />
            ))}
          </section>

          <section className="contests-highlight admin-aviso-form">
            <h3 className="com-icone"><CalendarCog size="1em" aria-hidden="true" /> Dados do evento</h3>
            {/* Depois de salvar, recarrega o painel para o resumo mostrar os novos dados. */}
            <EventForm evento={evento} onSalvo={carregar} />
          </section>

          <section className="contests-highlight admin-aviso-form">
            <h3 className="com-icone"><Megaphone size="1em" aria-hidden="true" /> Enviar aviso</h3>
            <NotificationForm />
          </section>

          <div className="admin-listas">
            <section className="contests-highlight">
              <h3 className="com-icone"><CalendarDays size="1em" aria-hidden="true" /> Próximas atividades</h3>
              {dados.proximasAtividades.length === 0 ? (
                <p className="contests-highlight__vazio">Nenhuma atividade futura na programação.</p>
              ) : (
                <ul className="admin-lista">
                  {dados.proximasAtividades.map((atividade) => (
                    <li key={atividade.id} className="admin-lista__item">
                      <span className="admin-lista__hora">{formatarDataHora(atividade.dataHoraInicio)}</span>
                      <span className="admin-lista__texto">
                        <strong>{atividade.titulo}</strong>
                        {atividade.local && <span>{atividade.local}</span>}
                      </span>
                      {atividade.status === 'atrasada' && (
                        <span className="admin-selo admin-selo--alerta">Atrasada</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/schedule" className="admin-listas__ver-mais">Ver programação</Link>
            </section>

            <section className="contests-highlight">
              <h3 className="com-icone"><Users size="1em" aria-hidden="true" /> Usuários recentes</h3>
              {dados.usuariosRecentes.length === 0 ? (
                <p className="contests-highlight__vazio">Nenhum usuário cadastrado.</p>
              ) : (
                <ul className="admin-lista">
                  {dados.usuariosRecentes.map((usuario) => (
                    <li key={usuario.id} className="admin-lista__item">
                      <span className="admin-lista__texto">
                        <strong>{usuario.nomeCompleto}</strong>
                        <span>{usuario.email} · desde {formatarData(usuario.createdAt)}</span>
                      </span>
                      <span className={`admin-selo ${usuario.ativo ? '' : 'admin-selo--inativo'}`}>
                        {usuario.ativo ? PERFIS[usuario.perfil] || usuario.perfil : 'Inativo'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/usuarios" className="admin-listas__ver-mais">Gerenciar usuários</Link>
            </section>
          </div>
        </>
      )}
    </Layout>
  );
}
