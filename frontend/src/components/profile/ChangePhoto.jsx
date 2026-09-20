import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ChangePhoto.css';

export default function ChangePhoto() {
  const [preview, setPreview] = useState('https://via.placeholder.com/150');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Cria uma URL local para pré-visualização da imagem
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select an image first!');
      return;
    }
    // Lógica para enviar o arquivo 'selectedFile' usando FormData para o backend
    console.log('Enviando arquivo:', selectedFile.name);
    alert('Photo updated successfully!');
  };

  return (
    <div className="change-photo">
      <div className="change-photo__container">
        <h1 className="change-photo__title">Change Photo</h1>
        <p className="change-photo__subtitle">Choose a new profile picture</p>

        <div className="change-photo__preview-area">
          <img src={preview} alt="Profile Preview" className="change-photo__avatar" />
        </div>

        <form className="change-photo__form" onSubmit={handleUpload}>
          <label htmlFor="file-upload" className="change-photo__file-label">
            Select New Image
          </label>
          <input 
            id="file-upload" 
            type="file" 
            accept="image/*" 
            className="change-photo__file-input" 
            onChange={handleFileChange} 
          />

          <div className="change-photo__actions">
            <button type="submit" className="change-photo__btn change-photo__btn--save">
              Upload Photo
            </button>
            <Link to="/" className="change-photo__btn change-photo__btn--cancel">
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}