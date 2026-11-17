import { useState } from 'react';
import { Save } from 'lucide-react';
import { salvarEvento } from '../../services/event';
import { deInputDataHora, paraInputDataHora } from '../../utils/dataEvento';
import './NotificationForm.css';

/**
 * Formulário do Painel admin com os dados do evento (RF18).
 *
 * O sistema trabalha com um evento por vez: sem evento, o formulário
 * cadastra; com evento, edita o atual. Esses dados aparecem na Home e o
 * check-in, a programação e os concursos ficam ligados a esse evento.
 */

function paraFormulario(evento) {
  return {
    nome: evento?.nome ?? '',
    edicao: evento?.edicao ?? '',
    localizacao: evento?.localizacao ?? '',
    inicio: paraInputDataHora(evento?.dataHoraInicio),
    fim: paraInputDataHora(evento?.dataHoraFim)
  };
}

export default function EventForm({ evento, onSalvo }) {
  const [dados, setDados] = useState(() => paraFormulario(evento));
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

    if (!dados.nome.trim() || !dados.inicio || !dados.fim) {
      setErro('Preencha o nome, o início e o término do evento.');
      return;
    }

    const dataHoraInicio = deInputDataHora(dados.inicio);
    const dataHoraFim = deInputDataHora(dados.fim);

    if (dataHoraFim <= dataHoraInicio) {
      setErro('O término do evento deve ser depois do início.');
      return;
    }

    setSalvando(true);
    try {
      const salvo = await salvarEvento({
        nome: dados.nome.trim(),
        edicao: dados.edicao === '' ? null : Number(dados.edicao),
        localizacao: dados.localizacao.trim() || null,
        dataHoraInicio,
        dataHoraFim
      });
      setSucesso('Dados do evento salvos!');
      onSalvo?.(salvo);
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o evento.');
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
          <span>Nome do evento</span>
          <input
            type="text"
            value={dados.nome}
            maxLength={120}
            onChange={(event) => alterar('nome', event.target.value)}
            placeholder="Ex.: Quintal da Amora"
          />
        </label>

        <label className="notification-form__campo notification-form__campo--tipo">
          <span>Edição</span>
          <input
            type="number"
            min={1}
            value={dados.edicao}
            onChange={(event) => alterar('edicao', event.target.value)}
            placeholder="Ex.: 15"
          />
        </label>
      </div>

      <label className="notification-form__campo">
        <span>Local</span>
        <input
          type="text"
          value={dados.localizacao}
          maxLength={200}
          onChange={(event) => alterar('localizacao', event.target.value)}
          placeholder="Ex.: Rua das Flores, 100 — Joinville"
        />
      </label>

      <div className="notification-form__linha">
        <label className="notification-form__campo">
          <span>Início</span>
          <input
            type="datetime-local"
            value={dados.inicio}
            onChange={(event) => alterar('inicio', event.target.value)}
          />
        </label>

        <label className="notification-form__campo">
          <span>Término</span>
          <input
            type="datetime-local"
            value={dados.fim}
            onChange={(event) => alterar('fim', event.target.value)}
          />
        </label>
      </div>

      <button type="submit" className="contests__btn-adicionar notification-form__enviar com-icone" disabled={salvando}>
        <Save size="1em" aria-hidden="true" />
        {salvando ? 'Salvando...' : evento ? 'Salvar alterações' : 'Cadastrar evento'}
      </button>
    </form>
  );
}
