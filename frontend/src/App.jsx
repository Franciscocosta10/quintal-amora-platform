import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RedefinirSenha from "./pages/auth/RedefinirSenha";
import CheckIn from "./pages/checkin/CheckIn";
import Schedule from "./pages/schedule/Schedule";
import Profile from "./components/profile/Profile";
import ChangePhoto from "./components/profile/ChangePhoto";
import HomePage from "./pages/HomePage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/checkin" element={<CheckIn />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<ChangePhoto />} />
    </Routes>
  );
}

export default App;