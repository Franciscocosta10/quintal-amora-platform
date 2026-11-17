import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import UserForm from '../../components/admin/UserForm';
import { useAuth } from '../../hooks/useAuth';
import { alterarUsuario, listarUsuarios } from '../../services/Admin';
import '../contest/Contests.css';
import '../../components/contest/ContestForm.css';
import './AdminDashboard.css';

/**
 * Tela "Usuários" do painel admin (RF17 — adicionar/remover usuário).
 *
 * - Adicionar: formulário que cria a conta com senha provisória.
 * - Remover: "Desativar" (a conta para de entrar, mas o histórico de
 *   check-ins e inscrições fica). "Reativar" desfaz.
 * - Perfil: "Tornar admin" dá acesso ao painel para alguém da organização.
 *
 * A própria conta não tem botões: o admin não pode se desativar nem se
 * rebaixar (a API também bloqueia).
 */

const PERFIS = {
  visitante: 'Participante',
  administrador: 'Administrador'
};

function formatarData(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(timestamp));
}

// Compara sem diferenciar maiúsculas e acentos ("jose" acha "José").
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function AdminUsers() {
  const { usuario: eu } = useAuth();
  const [usuarios, setUsuarios] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [alterandoId, setAlterandoId] = useState(null);

  // Sem setState síncrono aqui (regra react-hooks/set-state-in-effect).
  const carregar = useCallback(() => {
    return listarUsuarios()
      .then((lista) => {
        setUsuarios(lista);
        setErro('');
      })
      .catch((error) => setErro(error.message || 'Não foi possível carregar os usuários.'));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alterar(usuario, alteracoes) {
    setErro('');
    setAlterandoId(usuario.id);
    try {
      const atualizado = await alterarUsuario(usuario.id, alteracoes);
      setUsuarios((lista) => lista.map((item) => (item.id === atualizado.id ? atualizado : item)));
    } catch (error) {
      setErro(error.message || 'Não foi possível alterar o usuário.');
    } finally {
      setAlterandoId(null);
    }
  }

  const termo = normalizar(busca.trim());
  const filtrados = (usuarios ?? []).filter((usuario) =>
    !termo || normalizar(`${usuario.nomeCompleto} ${usuario.email}`).includes(termo)
  );

  return (
    <Layout>
      <div className="contests-header">
        <Link to="/admin" className="admin-voltar com-icone">
          <ArrowLeft size="1em" aria-hidden="true" /> Voltar ao painel
        </Link>
        <h1 className="com-icone"><Users size="1em" aria-hidden="true" /> Usuários</h1>
        <p>Adicione contas, dê acesso de administrador para a equipe ou desative quem não deve mais entrar.</p>
      </div>

      <section className="contests-highlight admin-aviso-form">
        <h3 className="com-icone"><UserPlus size="1em" aria-hidden="true" /> Adicionar usuário</h3>
        <UserForm onCriado={carregar} />
      </section>

      <section className="contests-highlight">
        <h3 className="com-icone">
          <Users size="1em" aria-hidden="true" />
          {usuarios ? `Todos os usuários (${usuarios.length})` : 'Todos os usuários'}
        </h3>

        {erro && (
          <div className="contest-form__error" role="alert">
            <span>!</span>
            <span>{erro}</span>
          </div>
        )}

        {!usuarios && !erro && <p className="admin-aviso">Carregando usuários...</p>}

        {usuarios && (
          <>
            <input
              type="search"
              className="admin-busca"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome ou e-mail"
              aria-label="Buscar usuário"
            />

            {filtrados.length === 0 ? (
              <p className="contests-highlight__vazio">Nenhum usuário encontrado.</p>
            ) : (
              <ul className="admin-lista">
                {filtrados.map((usuario) => {
                  const ehEu = usuario.id === eu?.id;
                  const ocupado = alterandoId === usuario.id;
                  const ehAdmin = usuario.perfil === 'administrador';

                  return (
                    <li key={usuario.id} className="admin-lista__item admin-lista__item--usuario">
                      <span className="admin-lista__texto">
                        <strong>{usuario.nomeCompleto}</strong>
                        <span>{usuario.email} · desde {formatarData(usuario.createdAt)}</span>
                      </span>

                      <span className={`admin-selo ${usuario.ativo ? '' : 'admin-selo--inativo'}`}>
                        {usuario.ativo ? PERFIS[usuario.perfil] || usuario.perfil : 'Inativo'}
                      </span>

                      {ehEu ? (
                        <span className="admin-selo admin-selo--inativo">Você</span>
                      ) : (
                        <span className="admin-lista__acoes">
                          <button
                            type="button"
                            className="admin-botao"
                            disabled={ocupado}
                            onClick={() => alterar(usuario, { perfil: ehAdmin ? 'visitante' : 'administrador' })}
                          >
                            {ehAdmin ? 'Tornar participante' : 'Tornar admin'}
                          </button>
                          <button
                            type="button"
                            className={`admin-botao ${usuario.ativo ? 'admin-botao--perigo' : ''}`}
                            disabled={ocupado}
                            onClick={() => alterar(usuario, { ativo: !usuario.ativo })}
                          >
                            {usuario.ativo ? 'Desativar' : 'Reativar'}
                          </button>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
    </Layout>
  );
}
