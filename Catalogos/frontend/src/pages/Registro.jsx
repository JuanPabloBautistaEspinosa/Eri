import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Registro() {
  const { register } = useAuth();
  const navegar = useNavigate();
  const [datos, setDatos] = useState({ nombre: "", email: "", password: "", confirmar: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (datos.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (datos.password !== datos.confirmar) return setError("Las contraseñas no coinciden.");

    setEnviando(true);
    try {
      await register({ nombre: datos.nombre.trim(), email: datos.email, password: datos.password });
      navegar("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="container py-5 caja-formulario">
      <h1 className="mb-4">Crear cuenta</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={enviar}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input id="nombre" name="nombre" className="form-control" required autoComplete="name"
            value={datos.nombre} onChange={cambiar} />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo</label>
          <input id="email" name="email" type="email" className="form-control" required autoComplete="email"
            value={datos.email} onChange={cambiar} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input id="password" name="password" type="password" className="form-control" required
            autoComplete="new-password" value={datos.password} onChange={cambiar} />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmar" className="form-label">Confirmar contraseña</label>
          <input id="confirmar" name="confirmar" type="password" className="form-control" required
            autoComplete="new-password" value={datos.confirmar} onChange={cambiar} />
        </div>
        <button className="btn btn-acento w-100" disabled={enviando}>
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-3 text-secondary">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </main>
  );
}
