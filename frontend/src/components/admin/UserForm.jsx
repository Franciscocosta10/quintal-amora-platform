import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { adicionarUsuario } from '../../services/Admin';
import './NotificationForm.css';

/**
 * Formulário "Adicionar usuário" da tela de usuários (RF17).
 *
 * O admin cria a conta de outra pessoa (ex.: alguém da organização) com uma
 * senha provisória e já escolhe o perfil. A pessoa pode trocar a senha
 * depois pelo "Esqueci minha senha".
 */

const VAZIO = { nomeCompleto: '', email: '', senha: '', perfil: 'visitante' };

export default function UserForm({ onCriado }) {
  const [dados, setDados] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function alterar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(event) {
    event.preventDefault();
    setErro('');
    setSucesso('');

    if (!dados.nomeCompleto.trim() || !dados.email.trim() || !dados.senha) {
      setErro('Preencha o nome, o e-mail e a senha provisória.');
      return;
    }

    if (dados.senha.length < 8) {
      setErro('A senha provisória precisa ter pelo menos 8 caracteres.');
      return;
    }

    setSalvando(true);
    try {
      const criado = await adicionarUsuario({
        nomeCompleto: dados.nomeCompleto.trim(),
        email: dados.email.trim(),
        senha: dados.senha,
        perfil: dados.perfil
      });
      setDados(VAZIO);
      setSucesso('Conta criada! Passe o e-mail e a senha provisória para a pessoa.');
      onCriado?.(criado);
    } catch (error) {
      setErro(error.message || 'Não foi possível criar a conta.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="notification-form" onSubmit={salvar}>
      {erro && (
        <div className="contest-form__error" role="alert">
          <span>!</span>
          <span>{erro}</span>
        </div>
      )}

      {sucesso && (
        <div className="contest-form__success" role="status">
          <span>✓</span>
          <span>{sucesso}</span>
        </div>
      )}

      <div className="notification-form__linha">
        <label className="notification-form__campo">
          <span>Nome completo</span>
          <input
            type="text"
            value={dados.nomeCompleto}
            maxLength={120}
            onChange={(event) => alterar('nomeCompleto', event.target.value)}
          />
        </label>

        <label className="notification-form__campo">
          <span>E-mail</span>
          <input
            type="email"
            value={dados.email}
            maxLength={200}
            onChange={(event) => alterar('email', event.target.value)}
          />
        </label>
      </div>

      <div className="notification-form__linha">
        <label className="notification-form__campo">
          <span>Senha provisória</span>
          <input
            type="text"
            value={dados.senha}
            autoComplete="off"
            onChange={(event) => alterar('senha', event.target.value)}
            placeholder="Mínimo de 8 caracteres"
          />
        </label>

        <label className="notification-form__campo notification-form__campo--tipo">
          <span>Perfil</span>
          <select value={dados.perfil} onChange={(event) => alterar('perfil', event.target.value)}>
            <option value="visitante">Participante</option>
            <option value="administrador">Administrador</option>
          </select>
        </label>
      </div>

      <button type="submit" className="contests__btn-adicionar notification-form__enviar com-icone" disabled={salvando}>
        <UserPlus size="1em" aria-hidden="true" />
        {salvando ? 'Criando...' : 'Criar conta'}
      </button>
    </form>
  );
}
