import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import TarjetaCancion from "../components/TarjetaCancion.jsx";

export default function DetalleBanda() {
  const { id } = useParams();
  const [banda, setBanda] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.obtenerBanda(id).then(setBanda).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/">Volver al catálogo</Link>
      </main>
    );
  }
  if (!banda) return <main className="container py-5 text-secondary">Cargando…</main>;

  return (
    <main className="container py-4 pb-5">
      <Link to="/" className="enlace-volver">Volver al catálogo</Link>

      <section className="row g-4 align-items-center my-3">
        {banda.imagen && (
          <div className="col-12 col-md-4">
            <img src={banda.imagen} alt={`Imagen de ${banda.nombre}`} className="img-fluid rounded" />
          </div>
        )}
        <div className={banda.imagen ? "col-12 col-md-8" : "col-12"}>
          <span className="etiqueta">{banda.genero}</span>
          <h1 className="titulo-banda">{banda.nombre}</h1>
          <p className="text-secondary">{banda.pais}</p>
          <p className="historia">{banda.historia}</p>
        </div>
      </section>

      <section>
        <h2 className="h1 mb-3">Canciones</h2>
        {banda.canciones.length === 0 ? (
          <p className="text-secondary">Esta banda aún no tiene canciones registradas.</p>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
            {banda.canciones.map((c) => (
              <div className="col" key={c.id}><TarjetaCancion cancion={c} /></div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
