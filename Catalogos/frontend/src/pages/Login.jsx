import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navegar = useNavigate();
  const [datos, setDatos] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await login(datos);
      navegar("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="container py-5 caja-formulario">
      <h1 className="mb-4">Iniciar sesión</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={enviar}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo</label>
          <input id="email" name="email" type="email" className="form-control" required
            autoComplete="email" value={datos.email} onChange={cambiar} />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input id="password" name="password" type="password" className="form-control" required
            autoComplete="current-password" value={datos.password} onChange={cambiar} />
        </div>
        <button className="btn btn-acento w-100" disabled={enviando}>
          {enviando ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>
      <p className="mt-3 text-secondary">
        ¿No tienes cuenta? <Link to="/registro">Crea una</Link>
      </p>
    </main>
  );
}
