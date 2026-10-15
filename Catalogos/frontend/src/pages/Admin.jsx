import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const BANDA_VACIA = { nombre: "", genero: "", pais: "", historia: "", imagen: "" };
const CANCION_VACIA = { titulo: "", anecdota: "" };

export default function Admin() {
  const { esAdmin } = useAuth();
  const [bandas, setBandas] = useState([]);
  const [seleccion, setSeleccion] = useState(null); // id de banda | "nueva" | null
  const [formBanda, setFormBanda] = useState(BANDA_VACIA);
  const [formCancion, setFormCancion] = useState(CANCION_VACIA);
  const [cancionEditando, setCancionEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setBandas(await api.listarBandas());
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    if (esAdmin) cargar();
  }, [esAdmin, cargar]);

  if (!esAdmin) {
    return (
      <main className="container py-5">
        <h1>Solo administradores</h1>
        <p className="text-secondary">Inicia sesión con una cuenta de administrador para gestionar el catálogo.</p>
        <Link className="btn btn-acento" to="/login">Iniciar sesión</Link>
      </main>
    );
  }

  const bandaActual = bandas.find((b) => b.id === seleccion);

  const avisar = (texto) => {
    setError("");
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  const elegir = (b) => {
    setSeleccion(b.id);
    setFormBanda({
      nombre: b.nombre, genero: b.genero || "", pais: b.pais || "",
      historia: b.historia || "", imagen: b.imagen || "",
    });
    setFormCancion(CANCION_VACIA);
    setCancionEditando(null);
  };

  const nueva = () => {
    setSeleccion("nueva");
    setFormBanda(BANDA_VACIA);
    setFormCancion(CANCION_VACIA);
    setCancionEditando(null);
  };

  const cambiarBanda = (e) => setFormBanda({ ...formBanda, [e.target.name]: e.target.value });
  const cambiarCancion = (e) => setFormCancion({ ...formCancion, [e.target.name]: e.target.value });

  const guardarBanda = async (e) => {
    e.preventDefault();
    try {
      if (seleccion === "nueva") {
        const creada = await api.crearBanda(formBanda);
        await cargar();
        setSeleccion(creada.id);
      } else {
        await api.actualizarBanda(seleccion, formBanda);
        await cargar();
      }
      avisar("Banda guardada.");
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarBanda = async () => {
    if (!window.confirm(`¿Eliminar "${bandaActual.nombre}" y todas sus canciones?`)) return;
    try {
      await api.eliminarBanda(seleccion);
      setSeleccion(null);
      await cargar();
      avisar("Banda eliminada.");
    } catch (err) {
      setError(err.message);
    }
  };

  const guardarCancion = async (e) => {
    e.preventDefault();
    try {
      if (cancionEditando) await api.actualizarCancion(cancionEditando, formCancion);
      else await api.crearCancion(seleccion, formCancion);
      setFormCancion(CANCION_VACIA);
      setCancionEditando(null);
      await cargar();
      avisar("Canción guardada.");
    } catch (err) {
      setError(err.message);
    }
  };

  const editarCancion = (c) => {
    setCancionEditando(c.id);
    setFormCancion({ titulo: c.titulo, anecdota: c.anecdota || "" });
  };

  const eliminarCancion = async (c) => {
    if (!window.confirm(`¿Eliminar la canción "${c.titulo}"?`)) return;
    try {
      await api.eliminarCancion(c.id);
      if (cancionEditando === c.id) {
        setCancionEditando(null);
        setFormCancion(CANCION_VACIA);
      }
      await cargar();
      avisar("Canción eliminada.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="container py-4 pb-5">
      <h1 className="mb-3">Administrar catálogo</h1>
      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-4">
        <aside className="col-12 col-lg-4">
          <button className="btn btn-acento w-100 mb-3" onClick={nueva}>Agregar banda</button>
          <div className="lista-admin">
            {bandas.length === 0 && <p className="text-secondary p-3 mb-0">Aún no hay bandas.</p>}
            {bandas.map((b) => (
              <button key={b.id} className={`item-admin ${b.id === seleccion ? "activo" : ""}`} onClick={() => elegir(b)}>
                <strong>{b.nombre}</strong>
                <span className="text-secondary small">{b.genero} · {b.canciones.length} canciones</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="col-12 col-lg-8">
          {seleccion === null ? (
            <p className="text-secondary">Elige una banda de la lista o agrega una nueva.</p>
          ) : (
            <>
              <form onSubmit={guardarBanda} className="panel-admin">
                <h2 className="h3 mb-3">{seleccion === "nueva" ? "Nueva banda" : "Datos de la banda"}</h2>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input id="nombre" name="nombre" className="form-control" required value={formBanda.nombre} onChange={cambiarBanda} />
                  </div>
                  <div className="col-6 col-md-3">
                    <label htmlFor="genero" className="form-label">Género</label>
                    <input id="genero" name="genero" className="form-control" required value={formBanda.genero} onChange={cambiarBanda} />
                  </div>
                  <div className="col-6 col-md-3">
                    <label htmlFor="pais" className="form-label">País</label>
                    <input id="pais" name="pais" className="form-control" value={formBanda.pais} onChange={cambiarBanda} />
                  </div>
                  <div className="col-12">
                    <label htmlFor="imagen" className="form-label">URL de la imagen (opcional)</label>
                    <input id="imagen" name="imagen" type="url" className="form-control" value={formBanda.imagen} onChange={cambiarBanda} />
                  </div>
                  <div className="col-12">
                    <label htmlFor="historia" className="form-label">Historia o descripción</label>
                    <textarea id="historia" name="historia" rows="5" className="form-control" required value={formBanda.historia} onChange={cambiarBanda} />
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button className="btn btn-acento">Guardar banda</button>
                  {seleccion !== "nueva" && (
                    <button type="button" className="btn btn-outline-danger" onClick={eliminarBanda}>Eliminar banda</button>
                  )}
                </div>
              </form>

              {seleccion !== "nueva" && bandaActual && (
                <div className="panel-admin mt-4">
                  <h2 className="h3 mb-3">Canciones de {bandaActual.nombre}</h2>

                  <ul className="list-unstyled mb-4">
                    {bandaActual.canciones.length === 0 && <li className="text-secondary">Aún no hay canciones.</li>}
                    {bandaActual.canciones.map((c) => (
                      <li key={c.id} className="fila-cancion">
                        <div>
                          <strong>{c.titulo}</strong>
                          <div className="text-secondary small">{c.anecdota}</div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-light" onClick={() => editarCancion(c)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarCancion(c)}>Eliminar</button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={guardarCancion}>
                    <h3 className="h5">{cancionEditando ? "Editar canción" : "Agregar canción"}</h3>
                    <div className="mb-3">
                      <label htmlFor="titulo" className="form-label">Título</label>
                      <input id="titulo" name="titulo" className="form-control" required value={formCancion.titulo} onChange={cambiarCancion} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="anecdota" className="form-label">Anécdota o dato interesante</label>
                      <textarea id="anecdota" name="anecdota" rows="3" className="form-control" value={formCancion.anecdota} onChange={cambiarCancion} />
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-acento">{cancionEditando ? "Guardar cambios" : "Agregar canción"}</button>
                      {cancionEditando && (
                        <button type="button" className="btn btn-outline-light"
                          onClick={() => { setCancionEditando(null); setFormCancion(CANCION_VACIA); }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
