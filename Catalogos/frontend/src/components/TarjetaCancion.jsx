import { useState } from "react";

// Al frente: título. Atrás: la anécdota. Se voltea con clic o con Enter/Espacio.
export default function TarjetaCancion({ cancion }) {
  const [volteada, setVolteada] = useState(false);
  const alternar = () => setVolteada((v) => !v);

  return (
    <div
      className={`voltear ${volteada ? "volteada" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={volteada}
      aria-label={`${cancion.titulo}. ${volteada ? "Ocultar" : "Ver"} anécdota`}
      onClick={alternar}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          alternar();
        }
      }}
    >
      <div className="voltear-interior">
        <div className="cara frente">
          <h3>{cancion.titulo}</h3>
          <span className="text-secondary small">Toca para ver la anécdota</span>
        </div>
        <div className="cara atras">
    <div className="d-flex gap-3 align-items-start">
      {cancion.url && cancion.imagen && (
        <a href={cancion.url} target="_blank" rel="noreferrer"
          className="enlace-cancion"
          aria-label={`Escuchar ${cancion.titulo} en Spotify`}
          onClick={(e) => e.stopPropagation()}>
          <img src={cancion.imagen} alt="" className="imagen-cancion" />
        </a>
      )}
      <p className="mb-0">{cancion.anecdota || "Aún no hay anécdota para esta canción."}</p>
    </div>

    {cancion.url && !cancion.imagen && (
      <a href={cancion.url} target="_blank" rel="noreferrer"
        className="btn btn-sm btn-light align-self-start"
        onClick={(e) => e.stopPropagation()}>
        Escuchar en Spotify
      </a>
    )}
  </div>
      </div>
    </div>
  );
}
