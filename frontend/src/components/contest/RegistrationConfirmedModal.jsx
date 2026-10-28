import './RegistrationConfirmedModal.css';

export default function RegistrationConfirmedModal({ concurso, onFechar }) {
  if (!concurso) return null;

  return (
    <div className="registration-confirmed-overlay" role="dialog" aria-modal="true">
      <div className="registration-confirmed-modal">
        <div className="registration-confirmed-modal__icon">✓</div>

        <h2>Inscrição confirmada!</h2>

        <p>
          Você está inscrito em <strong>{concurso.nome}</strong>.
        </p>

        <button
          type="button"
          className="registration-confirmed-modal__btn"
          onClick={onFechar}
        >
          OK
        </button>
      </div>
    </div>
  );
}