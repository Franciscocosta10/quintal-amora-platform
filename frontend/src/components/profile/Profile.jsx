import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  // Estado simulando os dados vindos da tabela Usuario
  const [formData, setFormData] = useState({
    name: 'Visitante Geek',
    email: 'visitante@email.com'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui entrará a requisição para a sua API (PUT /usuarios/:id)
    console.log('Dados atualizados:', formData);
    alert('Account updated successfully!');
  };

  return (
    <div className="profile">
      <div className="profile__container">
        <h1 className="profile__title">My Account</h1>
        <p className="profile__subtitle">Manage your personal information</p>

        <form className="profile__form" onSubmit={handleSubmit}>
          <div className="profile__field">
            <label htmlFor="name" className="profile__label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="profile__input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile__field">
            <label htmlFor="email" className="profile__label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="profile__input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile__actions">
            <button type="submit" className="profile__btn profile__btn--save">
              Save Changes
            </button>
            <Link to="/" className="profile__btn profile__btn--cancel">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}