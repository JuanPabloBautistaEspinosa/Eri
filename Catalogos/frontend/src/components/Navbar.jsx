import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const { usuario, esAdmin, logout } = useAuth();
  const navegar = useNavigate();
  const cerrar = () => setAbierto(false);

  const salir = () => {
    logout();
    cerrar();
    navegar("/");
  };

  return (
    <nav className="navbar navbar-expand-md barra">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={cerrar}>Bandas</Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${abierto ? "show" : ""}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end onClick={cerrar}>Catálogo</NavLink>
            </li>
            {esAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin" onClick={cerrar}>Administrar</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-md-center flex-column flex-md-row gap-2">
            {usuario ? (
              <>
                <span className="text-secondary me-md-2">Hola, {usuario.nombre}</span>
                <button className="btn btn-outline-light btn-sm" onClick={salir}>Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login" onClick={cerrar}>Iniciar sesión</Link>
                <Link className="btn btn-acento btn-sm" to="/registro" onClick={cerrar}>Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
