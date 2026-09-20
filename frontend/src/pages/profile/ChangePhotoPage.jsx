import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';

export default function ChangePhotoPage() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState('https://via.placeholder.com/150');
  const [selectedFile, setSelectedFile] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setErro('');
    }
  };

  async function handleUpload(evento) {
    evento.preventDefault();
    if (!selectedFile) {
      setErro('Please select an image first!');
      return;
    }

    setErro('');
    setSucesso('');
    setEnviando(true);

    try {
      // Lógica de envio da imagem via FormData para a API
      console.log('Enviando arquivo:', selectedFile.name);
      
      // Simulando o tempo de requisição
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSucesso('Photo updated successfully!');
    } catch (err) {
      setErro('Failed to upload photo. Try again.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amora-500 text-white shadow-sm shadow-amora-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
        <h1 className="text-lg font-semibold text-plum-900 underline decoration-amora-200 underline-offset-4">
          Change Photo
        </h1>
      </div>

      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(238,61,108,0.25)] flex flex-col items-center"
      >
        {erro && (
          <p className="mb-4 w-full rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 text-left" role="alert">
            {erro}
          </p>
        )}
        {sucesso && (
          <p className="mb-4 w-full rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 text-left" role="alert">
            {sucesso}
          </p>
        )}

        <div className="mb-6">
          <img 
            src={preview} 
            alt="Profile Preview" 
            className="h-32 w-32 rounded-full border-4 border-amora-200 object-cover shadow-sm"
          />
        </div>

        <label 
          htmlFor="file-upload" 
          className="w-full cursor-pointer rounded-xl border-2 border-dashed border-amora-200 bg-pink-50 py-4 text-center transition hover:bg-pink-100 hover:border-amora-500"
        >
          <span className="text-sm font-medium text-plum-900">
            {selectedFile ? selectedFile.name : 'Click to select a new image'}
          </span>
          <input 
            id="file-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>

        <button
          type="submit"
          disabled={enviando || !selectedFile}
          className="mt-6 w-full rounded-xl bg-amora-500 py-3 text-sm font-semibold text-white transition hover:bg-amora-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Uploading...' : 'Upload Photo'}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm">
        <Link to="/home" className="font-medium text-amora-500 underline underline-offset-2 hover:text-amora-600">
          Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
}