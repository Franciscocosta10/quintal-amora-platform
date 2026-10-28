import { useState } from 'react';
import './ContestForm.css';

const CATEGORIAS_SUGERIDAS = ['torneio', 'desfile', 'cosplay', 'quiz', 'outro'];

function formatarDataParaInput(timestampMs) {
  if (!timestampMs) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(timestampMs));
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

function criarInicioDoDia(data) {
  return new Date(`${data}T00:00:00-03:00`).getTime();
}

function criarFimDoDia(data) {
  return new Date(`${data}T23:59:59-03:00`).getTime();
}

function obterHojeSaoPaulo() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export default function ContestForm({
  concursoInicial = null,
  eventoId = null,
  onSalvar,
  onExcluir,
  onCancelar
}) {
  const editando = !!concursoInicial;

  const [formData, setFormData] = useState({
    nome: concursoInicial?.nome || '',
    categoria: concursoInicial?.categoria || '',
    descricao: concursoInicial?.descricao || '',
    limiteParticipantes: concursoInicial?.limiteParticipantes ?? '',
    dataConcurso: formatarDataParaInput(concursoInicial?.dataHoraInicio),
    horaInicio: formatarHoraParaInput(concursoInicial?.dataHoraInicio),
    horaTermino: formatarHoraParaInput(concursoInicial?.dataHoraFim),
    inscricaoDataInicio: formatarDataParaInput(concursoInicial?.inicioInscricao),
    inscricaoDataFim: formatarDataParaInput(concursoInicial?.fimInscricao)
  });

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErro('');
    setMensagemSucesso('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro('');
    setMensagemSucesso('');

    if (!formData.nome.trim()) {
      setErro('Informe o nome do concurso.');
      return;
    }

    if (!formData.dataConcurso || !formData.horaInicio) {
      setErro('Informe a data e o horário de início do concurso.');
      return;
    }

    if (!formData.horaTermino) {
      setErro('Informe o horário de término do concurso.');
      return;
    }

    if (!formData.inscricaoDataInicio) {
      setErro('Informe a data de início das inscrições.');
      return;
    }

    if (!formData.inscricaoDataFim) {
      setErro('Informe a data de término das inscrições.');
      return;
    }

    if (
      formData.limiteParticipantes !== '' &&
      Number(formData.limiteParticipantes) <= 0
    ) {
      setErro('O limite de participantes deve ser maior que zero.');
      return;
    }

    if (!editando && !eventoId) {
      setErro('Não foi possível identificar o evento atual.');
      return;
    }

    if (!editando && formData.dataConcurso < obterHojeSaoPaulo()) {
      setErro('A data do concurso não pode ser no passado.');
      return;
    }

    const dataHoraInicio = criarTimestamp(formData.dataConcurso, formData.horaInicio);
    const dataHoraFim = criarTimestamp(formData.dataConcurso, formData.horaTermino);
    const inicioInscricao = criarInicioDoDia(formData.inscricaoDataInicio);
    const fimInscricao = criarFimDoDia(formData.inscricaoDataFim);

    if (
      Number.isNaN(dataHoraInicio) ||
      Number.isNaN(dataHoraFim) ||
      Number.isNaN(inicioInscricao) ||
      Number.isNaN(fimInscricao)
    ) {
      setErro('Data ou horário inválido.');
      return;
    }

    if (dataHoraFim <= dataHoraInicio) {
      setErro('O horário de término deve ser depois do horário de início.');
      return;
    }

    if (inicioInscricao > fimInscricao) {
      setErro('A data de início das inscrições não pode ser depois do término.');
      return;
    }

    if (fimInscricao > dataHoraInicio) {
      setErro('As inscrições precisam encerrar antes do início do concurso.');
      return;
    }

    const dados = {
      nome: formData.nome.trim(),
      categoria: formData.categoria.trim() || null,
      descricao: formData.descricao.trim() || null,
      dataHoraInicio,
      dataHoraFim,
      limiteParticipantes:
        formData.limiteParticipantes === '' ? null : Number(formData.limiteParticipantes),
      inicioInscricao,
      fimInscricao
    };

    if (!editando) {
      dados.evento = eventoId;
    }

    try {
      setSalvando(true);

      await onSalvar(dados);

      setMensagemSucesso(
        editando ? 'Concurso atualizado com sucesso!' : 'Concurso criado com sucesso!'
      );
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o concurso.');
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
    if (!concursoInicial?.id) return;

    try {
      setExcluindo(true);
      setErro('');

      await onExcluir(concursoInicial.id);

      setModalExclusaoAberto(false);
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir o concurso.');
      setExcluindo(false);
    }
  }

  return (
    <>
      <div className="contest-form-overlay">
        <div
          className="contest-form"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contest-form-title"
        >
          <div className="contest-form__header">
            <div>
              <h2 id="contest-form-title">
                {editando ? 'Editar concurso' : 'Novo concurso'}
              </h2>

              <p>
                {editando
                  ? 'Atualize as informações do concurso.'
                  : 'Cadastre um novo concurso no evento.'}
              </p>
            </div>

            <button
              type="button"
              className="contest-form__close"
              onClick={onCancelar}
              disabled={salvando || excluindo}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          {mensagemSucesso && (
            <div className="contest-form__success" role="status">
              <span>✓</span>
              <span>{mensagemSucesso}</span>
            </div>
          )}

          {erro && (
            <div className="contest-form__error" role="alert">
              <span>!</span>
              <span>{erro}</span>
            </div>
          )}

          <form className="contest-form__body" onSubmit={handleSubmit}>
            <h3 className="contest-form__section-title">Informações do concurso</h3>

            <div className="contest-form__field">
              <label htmlFor="nome">
                Nome <span className="required-mark">*</span>
              </label>

              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex.: Concurso de Cosplay"
                required
              />
            </div>

            <div className="contest-form__field">
              <label htmlFor="descricao">Descrição</label>

              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva brevemente o concurso..."
                rows="3"
              />
            </div>

            <div className="contest-form__row">
              <div className="contest-form__field">
                <label htmlFor="categoria">Categoria</label>

                <input
                  type="text"
                  id="categoria"
                  name="categoria"
                  list="categorias-sugeridas"
                  value={formData.categoria}
                  onChange={handleChange}
                  placeholder="Ex.: cosplay"
                />
                <datalist id="categorias-sugeridas">
                  {CATEGORIAS_SUGERIDAS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="contest-form__field">
                <label htmlFor="limiteParticipantes">
                  Limite de participantes
                </label>

                <input
                  type="number"
                  id="limiteParticipantes"
                  name="limiteParticipantes"
                  min="1"
                  value={formData.limiteParticipantes}
                  onChange={handleChange}
                  placeholder="Sem limite"
                />
              </div>
            </div>

            <div className="contest-form__row">
              <div className="contest-form__field">
                <label htmlFor="dataConcurso">
                  Data do concurso <span className="required-mark">*</span>
                </label>

                <input
                  type="date"
                  id="dataConcurso"
                  name="dataConcurso"
                  value={formData.dataConcurso}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contest-form__field">
                <label htmlFor="horaInicio">
                  Horário de início <span className="required-mark">*</span>
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
            </div>

            <div className="contest-form__field">
              <label htmlFor="horaTermino">
                Horário de término <span className="required-mark">*</span>
              </label>

              <input
                type="time"
                id="horaTermino"
                name="horaTermino"
                value={formData.horaTermino}
                onChange={handleChange}
                required
              />
            </div>

            <h3 className="contest-form__section-title">Período de inscrições</h3>

            <div className="contest-form__row">
              <div className="contest-form__field">
                <label htmlFor="inscricaoDataInicio">
                  Data de início <span className="required-mark">*</span>
                </label>

                <input
                  type="date"
                  id="inscricaoDataInicio"
                  name="inscricaoDataInicio"
                  value={formData.inscricaoDataInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contest-form__field">
                <label htmlFor="inscricaoDataFim">
                  Data de término <span className="required-mark">*</span>
                </label>

                <input
                  type="date"
                  id="inscricaoDataFim"
                  name="inscricaoDataFim"
                  value={formData.inscricaoDataFim}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="contest-form__actions">
              {editando && (
                <button
                  type="button"
                  className="contest-form__delete"
                  onClick={abrirModalExclusao}
                  disabled={salvando || excluindo}
                >
                  Excluir concurso
                </button>
              )}

              <button
                type="button"
                className="contest-form__cancel"
                onClick={onCancelar}
                disabled={salvando || excluindo}
              >
                Cancelar
              </button>

              <button type="submit" className="contest-form__save" disabled={salvando || excluindo}>
                {salvando
                  ? 'Salvando...'
                  : editando
                    ? 'Salvar alterações'
                    : 'Adicionar concurso'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {modalExclusaoAberto && (
        <div
          className="contest-delete-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contest-delete-title"
        >
          <div className="contest-delete-modal">
            <div className="contest-delete-modal__icon">!</div>

            <h2 id="contest-delete-title">Excluir concurso?</h2>

            <p>
              Tem certeza que deseja excluir
              <strong> "{concursoInicial?.nome}"</strong>?
            </p>

            <p className="contest-delete-modal__warning">
              Todas as inscrições relacionadas também serão removidas. Essa
              ação não poderá ser desfeita.
            </p>

            <div className="contest-delete-modal__actions">
              <button
                type="button"
                className="contest-form__cancel"
                onClick={fecharModalExclusao}
                disabled={excluindo}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="contest-delete-modal__confirm"
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}