import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import TarjetaBanda from "../components/TarjetaBanda.jsx";

export default function Catalogo() {
  const [bandas, setBandas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [genero, setGenero] = useState("");

  useEffect(() => {
    api.listarBandas()
      .then(setBandas)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  const generos = useMemo(() => [...new Set(bandas.map((b) => b.genero).filter(Boolean))].sort(), [bandas]);

  const visibles = bandas.filter(
    (b) => b.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()) && (!genero || b.genero === genero)
  );

  return (
    <>
      <header className="hero">
        <div className="container">
          <h1>Todas las <span>bandas</span><br />en un lugar</h1>
          <p>Conoce la historia de cada banda y descubre la anécdota detrás de sus canciones.</p>

          <div className="row g-2 mt-3">
            <div className="col-12 col-md-7 col-lg-6">
              <label htmlFor="busqueda" className="visually-hidden">Buscar banda</label>
              <input id="busqueda" type="search" className="form-control form-control-lg" placeholder="Buscar banda"
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <div className="col-12 col-md-5 col-lg-3">
              <label htmlFor="genero" className="visually-hidden">Género</label>
              <select id="genero" className="form-select form-select-lg" value={genero} onChange={(e) => setGenero(e.target.value)}>
                <option value="">Todos los géneros</option>
                {generos.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container pb-5">
        {cargando && <p className="text-secondary">Cargando bandas…</p>}
        {error && <div className="alert alert-danger">No se pudieron cargar las bandas: {error}</div>}
        {!cargando && !error && visibles.length === 0 && (
          <p className="text-secondary">No hay bandas con esos filtros. Prueba con otro nombre o género.</p>
        )}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {visibles.map((b) => (
            <div className="col" key={b.id}><TarjetaBanda banda={b} /></div>
          ))}
        </div>
      </main>
    </>
  );
}
