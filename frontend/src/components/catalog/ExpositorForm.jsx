import { useEffect, useRef, useState } from 'react';
import { TIPOS_EXPOSITOR } from './tiposExpositor';
import { REDES_SOCIAIS, ehLinkSeguro, normalizarLinkRede } from '../../utils/redesSociais';
// Reaproveita o CSS do modal de Concurso de propósito: o visual do
// formulário fica idêntico por construção, sem duplicar ~300 linhas.
import '../contest/ContestForm.css';
import './ExpositorForm.css';

function estadoInicial(expositor) {
  const redes = expositor?.redesSociais || {};

  return {
    nome: expositor?.nome || '',
    tipo: expositor?.tipo || '',
    descricao: expositor?.descricao || '',
    localizacaoEstande: expositor?.localizacaoEstande || '',
    contato: expositor?.contato || '',
    imagem: expositor?.imagem || '',
    ...Object.fromEntries(REDES_SOCIAIS.map((rede) => [rede.chave, redes[rede.chave] || '']))
  };
}

function textoOuNull(valor) {
  const texto = valor.trim();
  return texto === '' ? null : texto;
}

export default function ExpositorForm({
  expositorInicial = null,
  eventoId = null,
  onSalvar,
  onExcluir,
  onCancelar
}) {
  const editando = !!expositorInicial;

  const [formData, setFormData] = useState(() => estadoInicial(expositorInicial));
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const alertaRef = useRef(null);

  // O botão de salvar fica no fim de um formulário com rolagem; sem isto
  // o alerta aparece no topo, fora da vista, e parece que nada aconteceu.
  useEffect(() => {
    if (erro) alertaRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [erro]);

  const imagemPreview = formData.imagem.trim();

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErro('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!formData.nome.trim()) {
      setErro('Informe o nome do expositor.');
      return;
    }

    if (!formData.tipo) {
      setErro('Selecione se o expositor é uma loja ou um artista.');
      return;
    }

    if (imagemPreview && !ehLinkSeguro(imagemPreview)) {
      setErro('A imagem deve ser um link começando com http:// ou https://.');
      return;
    }

    if (!editando && !eventoId) {
      setErro('Não foi possível identificar o evento atual.');
      return;
    }

    const redesSociais = {};
    REDES_SOCIAIS.forEach((rede) => {
      const link = normalizarLinkRede(rede.chave, formData[rede.chave]);
      if (link) redesSociais[rede.chave] = link;
    });

    const dados = {
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      descricao: textoOuNull(formData.descricao),
      localizacaoEstande: textoOuNull(formData.localizacaoEstande),
      contato: textoOuNull(formData.contato),
      imagem: textoOuNull(formData.imagem),
      redesSociais: Object.keys(redesSociais).length > 0 ? redesSociais : null
    };

    if (!editando) {
      dados.evento = eventoId;
    }

    try {
      setSalvando(true);
      await onSalvar(dados);
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o expositor.');
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    try {
      setExcluindo(true);
      setErro('');
      await onExcluir(expositorInicial.id);
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir o expositor.');
      setExcluindo(false);
      setModalExclusaoAberto(false);
    }
  }

  const ocupado = salvando || excluindo;

  return (
    <>
      <div className="contest-form-overlay">
        <div
          className="contest-form"
          role="dialog"
          aria-modal="true"
          aria-labelledby="expositor-form-title"
        >
          <div className="contest-form__header">
            <div>
              <h2 id="expositor-form-title">
                {editando ? 'Editar expositor' : 'Novo expositor'}
              </h2>

              <p>
                {editando
                  ? 'Atualize as informações da loja ou artista.'
                  : 'Cadastre uma loja ou artista no catálogo do evento.'}
              </p>
            </div>

            <button
              type="button"
              className="contest-form__close"
              onClick={onCancelar}
              disabled={ocupado}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          {erro && (
            <div className="contest-form__error" role="alert" ref={alertaRef}>
              <span>!</span>
              <span>{erro}</span>
            </div>
          )}

          <form className="contest-form__body" onSubmit={handleSubmit} noValidate>
            <h3 className="contest-form__section-title">Informações do expositor</h3>

            <div className="contest-form__row">
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
                  placeholder="Ex.: Ateliê Sakura"
                  maxLength={120}
                  required
                />
              </div>

              <div className="contest-form__field">
                <label htmlFor="tipo">
                  Tipo <span className="required-mark">*</span>
                </label>

                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {Object.entries(TIPOS_EXPOSITOR).map(([valor, tipo]) => (
                    <option key={valor} value={valor}>
                      {tipo.rotulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="contest-form__field">
              <label htmlFor="descricao">Descrição</label>

              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="O que a loja vende ou o que o artista produz..."
                rows="3"
                maxLength={2000}
              />
            </div>

            <div className="contest-form__row">
              <div className="contest-form__field">
                <label htmlFor="localizacaoEstande">Localização / estande</label>

                <input
                  type="text"
                  id="localizacaoEstande"
                  name="localizacaoEstande"
                  value={formData.localizacaoEstande}
                  onChange={handleChange}
                  placeholder="Ex.: Estande 12"
                  maxLength={80}
                />
              </div>

              <div className="contest-form__field">
                <label htmlFor="contato">Contato</label>

                <input
                  type="text"
                  id="contato"
                  name="contato"
                  value={formData.contato}
                  onChange={handleChange}
                  placeholder="E-mail ou WhatsApp"
                  maxLength={120}
                />
              </div>
            </div>

            <div className="contest-form__field">
              <label htmlFor="imagem">Imagem (link)</label>

              <div className="expositor-form__imagem">
                <input
                  type="url"
                  id="imagem"
                  name="imagem"
                  value={formData.imagem}
                  onChange={handleChange}
                  placeholder="https://..."
                  maxLength={2048}
                />

                {ehLinkSeguro(imagemPreview) && (
                  <img
                    key={imagemPreview}
                    className="expositor-form__preview"
                    src={imagemPreview}
                    alt="Pré-visualização da imagem"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                )}
              </div>
            </div>

            <h3 className="contest-form__section-title">Redes sociais</h3>

            <div className="contest-form__row">
              {REDES_SOCIAIS.map((rede) => (
                <div key={rede.chave} className="contest-form__field">
                  <label htmlFor={rede.chave}>{rede.rotulo}</label>

                  <input
                    type="text"
                    id={rede.chave}
                    name={rede.chave}
                    value={formData[rede.chave]}
                    onChange={handleChange}
                    placeholder={rede.placeholder}
                  />
                </div>
              ))}
            </div>

            <p className="expositor-form__dica">
              Pode digitar só o @usuário — o link completo é montado automaticamente.
            </p>

            <div className="contest-form__actions">
              {editando && (
                <button
                  type="button"
                  className="contest-form__delete"
                  onClick={() => setModalExclusaoAberto(true)}
                  disabled={ocupado}
                >
                  Excluir expositor
                </button>
              )}

              <button
                type="button"
                className="contest-form__cancel"
                onClick={onCancelar}
                disabled={ocupado}
              >
                Cancelar
              </button>

              <button type="submit" className="contest-form__save" disabled={ocupado}>
                {salvando
                  ? 'Salvando...'
                  : editando
                    ? 'Salvar alterações'
                    : 'Adicionar expositor'}
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
          aria-labelledby="expositor-delete-title"
        >
          <div className="contest-delete-modal">
            <div className="contest-delete-modal__icon">!</div>

            <h2 id="expositor-delete-title">Excluir expositor?</h2>

            <p>
              Tem certeza que deseja excluir
              <strong> "{expositorInicial?.nome}"</strong>?
            </p>

            <p className="contest-delete-modal__warning">
              Ele deixará de aparecer no catálogo. Essa ação não poderá ser desfeita.
            </p>

            <div className="contest-delete-modal__actions">
              <button
                type="button"
                className="contest-form__cancel"
                onClick={() => setModalExclusaoAberto(false)}
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
