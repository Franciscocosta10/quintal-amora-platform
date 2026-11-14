import { Routes, Route, useLocation } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RedefinirSenha from "./pages/auth/RedefinirSenha";
import CheckIn from "./pages/checkin/CheckIn";
import Schedule from "./pages/schedule/Schedule";
import Profile from "./components/profile/Profile";
import ChangePhoto from "./components/profile/ChangePhoto";
import Contests from "./pages/contest/Contests";
import HomePage from "./pages/HomePage";
import Catalog from "./pages/catalog/Catalog";


// Telas que abrem como modal por cima de outra (ver ModalPagina).
const ROTAS_MODAL = ["/profile", "/settings"];

function App() {
  const location = useLocation();
  const ehModal = ROTAS_MODAL.includes(location.pathname);

  // Perfil e Trocar foto abrem por cima de outra tela, que fica desfocada ao
  // fundo. Vindo do menu do usuário, é a tela onde ele estava
  // (state.background); acessando direto pela URL, a Home.
  const fundo = ehModal ? location.state?.background ?? "/home" : location;

  return (
    <>
    <Routes location={fundo}>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/checkin" element={<CheckIn />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/concursos" element={<Contests />} />
      <Route path="/catalogo" element={<Catalog />} />
    </Routes>

    {ehModal && (
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<ChangePhoto />} />
      </Routes>
    )}
    </>
  );
}

export default App;