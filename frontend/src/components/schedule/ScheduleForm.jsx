import { useState } from 'react';
import './ScheduleForm.css';

const TIPOS = [
  { value: 'atracao', label: 'Atração' },
  { value: 'apresentacao', label: 'Apresentação' },
  { value: 'encontro', label: 'Encontro' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'outro', label: 'Outro' }
];

function formatarDataParaInput(timestampMs) {
  if (!timestampMs) return '';

  const data = new Date(timestampMs);

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(data);
}

function formatarHoraParaInput(timestampMs) {
  if (!timestampMs) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(timestampMs));
}

function criarTimestamp(data, hora) {
  return new Date(`${data}T${hora}:00-03:00`).getTime();
}

export default function ScheduleForm({
  atividadeInicial = null,
  eventoId = null,
  onSalvar,
  onExcluir,
  onCancelar
}) {
  const editando = !!atividadeInicial;

  const [formData, setFormData] = useState({
    titulo: atividadeInicial?.titulo || '',
    descricao: atividadeInicial?.descricao || '',
    tipo: atividadeInicial?.tipo || 'outro',
    data: formatarDataParaInput(atividadeInicial?.dataHoraInicio),
    horaInicio: formatarHoraParaInput(atividadeInicial?.dataHoraInicio),
    horaFim: formatarHoraParaInput(atividadeInicial?.dataHoraFim),
    local: atividadeInicial?.local || '',
    destaque: atividadeInicial?.destaque || false
  });

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    setErro('');
    setMensagemSucesso('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro('');
    setMensagemSucesso('');

    if (!formData.titulo.trim()) {
      setErro('Informe o título da atividade.');
      return;
    }

    if (!formData.data) {
      setErro('Informe a data da atividade.');
      return;
    }

    if (!formData.horaInicio) {
      setErro('Informe o horário de início.');
      return;
    }

    if (!formData.horaFim) {
      setErro('Informe o horário de término.');
      return;
    }

    if (formData.horaFim <= formData.horaInicio) {
      setErro('O horário de término deve ser posterior ao início.');
      return;
    }

    if (!editando && !eventoId) {
      setErro('Não foi possível identificar o evento atual.');
      return;
    }

    const dataHoraInicio = criarTimestamp(
      formData.data,
      formData.horaInicio
    );

    const dataHoraFim = criarTimestamp(
      formData.data,
      formData.horaFim
    );

    if (
      Number.isNaN(dataHoraInicio) ||
      Number.isNaN(dataHoraFim)
    ) {
      setErro('Data ou horário inválido.');
      return;
    }

    const dados = {
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim() || null,
      tipo: formData.tipo,
      dataHoraInicio,
      dataHoraFim,
      local: formData.local.trim() || null,
      destaque: formData.destaque
    };

    if (!editando) {
      dados.evento = eventoId;
    }

    try {
      setSalvando(true);

      await onSalvar(dados);

      setMensagemSucesso(
        editando
          ? 'Atividade atualizada com sucesso!'
          : 'Atividade criada com sucesso!'
      );
    } catch (error) {
      setErro(
        error.message ||
        'Não foi possível salvar a atividade.'
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirModalExclusao() {
    setErro('');
    setMensagemSucesso('');
    setModalExclusaoAberto(true);
  }

  function fecharModalExclusao() {
    if (!excluindo) {
      setModalExclusaoAberto(false);
    }
  }

  async function confirmarExclusao() {
    if (!atividadeInicial?.id) return;

    try {
      setExcluindo(true);
      setErro('');

      await onExcluir(atividadeInicial.id);

      setModalExclusaoAberto(false);
    } catch (error) {
      setErro(
        error.message ||
        'Não foi possível excluir a atividade.'
      );
      setExcluindo(false);
    }
  }

  return (
    <>
      <div className="schedule-form-overlay">
        <div
          className="schedule-form"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-form-title"
        >
          <div className="schedule-form__header">
            <div>
              <h2 id="schedule-form-title">
                {editando
                  ? 'Editar atividade'
                  : 'Nova atividade'}
              </h2>

              <p>
                {editando
                  ? 'Atualize as informações da atividade.'
                  : 'Cadastre uma nova atividade na programação.'}
              </p>
            </div>

            <button
              type="button"
              className="schedule-form__close"
              onClick={onCancelar}
              disabled={salvando || excluindo}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          {mensagemSucesso && (
            <div
              className="schedule-form__success"
              role="status"
            >
              <span>✓</span>
              <span>{mensagemSucesso}</span>
            </div>
          )}

          {erro && (
            <div
              className="schedule-form__error"
              role="alert"
            >
              <span>!</span>
              <span>{erro}</span>
            </div>
          )}

          <form
            className="schedule-form__body"
            onSubmit={handleSubmit}
          >
            <div className="schedule-form__field">
              <label htmlFor="titulo">
                Título
              </label>

              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ex.: Oficina de Desenho"
                required
              />
            </div>

            <div className="schedule-form__field">
              <label htmlFor="descricao">
                Descrição
              </label>

              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva brevemente a atividade..."
                rows="3"
              />
            </div>

            <div className="schedule-form__row">
              <div className="schedule-form__field">
                <label htmlFor="tipo">
                  Tipo
                </label>

                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  {TIPOS.map((tipo) => (
                    <option
                      key={tipo.value}
                      value={tipo.value}
                    >
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="schedule-form__field">
                <label htmlFor="local">
                  Local
                </label>

                <input
                  type="text"
                  id="local"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  placeholder="Ex.: Palco Principal"
                />
              </div>
            </div>

            <div className="schedule-form__row">
              <div className="schedule-form__field">
                <label htmlFor="data">
                  Data
                </label>

                <input
                  type="date"
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="schedule-form__field">
                <label htmlFor="horaInicio">
                  Início
                </label>

                <input
                  type="time"
                  id="horaInicio"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="schedule-form__field">
                <label htmlFor="horaFim">
                  Término
                </label>

                <input
                  type="time"
                  id="horaFim"
                  name="horaFim"
                  value={formData.horaFim}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label className="schedule-form__checkbox">
              <input
                type="checkbox"
                name="destaque"
                checked={formData.destaque}
                onChange={handleChange}
              />

              <span>
                Destacar esta atividade
              </span>
            </label>

            <div className="schedule-form__actions">
              {editando && (
                <button
                  type="button"
                  className="schedule-form__delete"
                  onClick={abrirModalExclusao}
                  disabled={salvando || excluindo}
                >
                  Excluir atividade
                </button>
              )}

              <button
                type="button"
                className="schedule-form__cancel"
                onClick={onCancelar}
                disabled={salvando || excluindo}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="schedule-form__save"
                disabled={salvando || excluindo}
              >
                {salvando
                  ? 'Salvando...'
                  : editando
                    ? 'Salvar alterações'
                    : 'Adicionar atividade'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {modalExclusaoAberto && (
        <div
          className="schedule-delete-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-delete-title"
        >
          <div className="schedule-delete-modal">
            <div className="schedule-delete-modal__icon">
              !
            </div>

            <h2 id="schedule-delete-title">
              Excluir atividade?
            </h2>

            <p>
              Tem certeza que deseja excluir
              <strong> "{atividadeInicial?.titulo}"</strong>?
            </p>

            <p className="schedule-delete-modal__warning">
              Essa ação não poderá ser desfeita.
            </p>

            <div className="schedule-delete-modal__actions">
              <button
                type="button"
                className="schedule-form__cancel"
                onClick={fecharModalExclusao}
                disabled={excluindo}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="schedule-delete-modal__confirm"
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo
                  ? 'Excluindo...'
                  : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}