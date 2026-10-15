import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import DetalleBanda from "./pages/DetalleBanda.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <>
    <video className="video-global" autoPlay muted loop playsInline aria-hidden="true">
  <source src="/video/Ranmstein.mp4" type="video/mp4" />
      </video>
      <div className="capa-global" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/banda/:id" element={<DetalleBanda />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<main className="container py-5">Esta página no existe.</main>} />
      </Routes>
    </>
  );
}
