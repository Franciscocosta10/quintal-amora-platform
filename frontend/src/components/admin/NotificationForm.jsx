import { useState } from 'react';
import { Send } from 'lucide-react';
import { enviarNotificacao } from '../../services/Notificacao';
import { TIPOS_NOTIFICACAO } from '../tiposNotificacao';
import './NotificationForm.css';

/**
 * Formulário do painel admin para enviar um aviso aos participantes
 * (RF11 / RF12). Enquanto envia, o botão mostra "Enviando..." e fica
 * desabilitado, para o admin não disparar o mesmo aviso duas vezes.
 */

const FORMULARIO_VAZIO = { titulo: '', mensagem: '', tipo: 'aviso_geral' };

export default function NotificationForm() {
  const [dados, setDados] = useState(FORMULARIO_VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function alterar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar(event) {
    event.preventDefault();
    setErro('');
    setSucesso('');

    if (!dados.titulo.trim() || !dados.mensagem.trim()) {
      setErro('Preencha o título e a mensagem do aviso.');
      return;
    }

    setEnviando(true);
    try {
      await enviarNotificacao({
        titulo: dados.titulo.trim(),
        mensagem: dados.mensagem.trim(),
        tipo: dados.tipo
      });
      setDados(FORMULARIO_VAZIO);
      setSucesso('Aviso enviado! Os participantes verão no sino em alguns segundos.');
    } catch (error) {
      setErro(error.message || 'Não foi possível enviar o aviso.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="notification-form" onSubmit={enviar}>
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
          <span>Título</span>
          <input
            type="text"
            value={dados.titulo}
            maxLength={120}
            onChange={(event) => alterar('titulo', event.target.value)}
            placeholder="Ex.: Concurso cosplay começa em 10 min"
          />
        </label>

        <label className="notification-form__campo notification-form__campo--tipo">
          <span>Tipo</span>
          <select value={dados.tipo} onChange={(event) => alterar('tipo', event.target.value)}>
            {Object.entries(TIPOS_NOTIFICACAO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="notification-form__campo">
        <span>Mensagem</span>
        <textarea
          rows={3}
          value={dados.mensagem}
          maxLength={1000}
          onChange={(event) => alterar('mensagem', event.target.value)}
          placeholder="O que os participantes precisam saber?"
        />
      </label>

      <button type="submit" className="contests__btn-adicionar notification-form__enviar com-icone" disabled={enviando}>
        <Send size="1em" aria-hidden="true" />
        {enviando ? 'Enviando...' : 'Enviar aviso'}
      </button>
    </form>
  );
}
