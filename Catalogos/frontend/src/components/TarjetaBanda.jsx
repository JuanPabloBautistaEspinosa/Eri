import { Link } from "react-router-dom";

const COLORES = ["#ff3d81", "#3d8bff", "#14b8a6", "#f97316", "#8b5cf6", "#e11d48", "#0ea5e9", "#65a30d"];

export default function TarjetaBanda({ banda }) {
  return (
    <Link to={`/banda/${banda.id}`} className="tarjeta-banda" aria-label={`Ver ${banda.nombre}`}>
      {banda.imagen ? (
        <img src={banda.imagen} alt={`Imagen de ${banda.nombre}`} className="portada" loading="lazy" />
      ) : (
        <div className="portada portada-vacia" style={{ background: COLORES[banda.id % COLORES.length] }} aria-hidden="true">
          {banda.nombre[0]}
        </div>
      )}
      <div className="info">
        <span className="etiqueta">{banda.genero}</span>
        <h3>{banda.nombre}</h3>
        <div className="text-secondary small">{banda.pais}</div>
      </div>
    </Link>
  );
}
