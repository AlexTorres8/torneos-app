/**
 * Skeleton — componentes de carga animados.
 *
 * Uso:
 *   <Skeleton.Tabla grupos={2} />         → 2 tablas de clasificación
 *   <Skeleton.Bracket rondas={3} />       → bracket de 3 columnas
 *   <Skeleton.TorneosLista items={3} />   → lista de torneos en LigasFutsal / TorneosPadel
 */

// Bloque base animado
function Pulse({ className = '' }) {
  return (
    <div
      className={`bg-slate-800/70 rounded animate-pulse ${className}`}
    />
  );
}

// ── Tabla de clasificación ────────────────────────────────────────────────
function Tabla({ grupos = 2 }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {Array.from({ length: grupos }).map((_, gi) => (
        <div key={gi} className="bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden">
          {/* Cabecera grupo */}
          <div className="px-4 py-3 border-b border-slate-800 bg-black/20">
            <Pulse className="h-3 w-24" />
          </div>
          {/* Filas */}
          {Array.from({ length: 4 }).map((_, ri) => (
            <div key={ri} className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0">
              <Pulse className="h-3 w-4 flex-shrink-0" />
              <Pulse className="h-3 flex-1" />
              <Pulse className="h-3 w-6 flex-shrink-0" />
              <Pulse className="h-3 w-6 flex-shrink-0" />
              <Pulse className="h-3 w-6 flex-shrink-0" />
              <Pulse className="h-3 w-8 flex-shrink-0" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Lista de torneos (LigasFutsal / TorneosPadel) ─────────────────────────
function TorneosLista({ items = 3 }) {
  return (
    <div className="grid gap-5">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-[#0f172a]/90 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
            <Pulse className="h-6 w-48 max-w-full" />
            <Pulse className="h-3 w-20" />
          </div>
          <Pulse className="h-11 w-full md:w-36 rounded" />
        </div>
      ))}
    </div>
  );
}

// ── Bracket fase final ────────────────────────────────────────────────────
function Bracket({ rondas = 3 }) {
  // nº de partidos por ronda: [4, 2, 1] para rondas=3
  const partidosPorRonda = Array.from({ length: rondas }, (_, i) =>
    Math.pow(2, rondas - 1 - i)
  );

  return (
    <div className="flex gap-12 items-start overflow-x-auto pb-4">
      {partidosPorRonda.map((count, ci) => (
        <div key={ci} className="flex flex-col gap-6 flex-shrink-0" style={{ marginTop: ci * 40 }}>
          {/* Etiqueta columna */}
          <Pulse className="h-3 w-24 mx-auto" />
          {Array.from({ length: count }).map((_, pi) => (
            <div
              key={pi}
              className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 w-52 space-y-3"
            >
              {/* Equipo local */}
              <div className="flex justify-between items-center gap-2">
                <Pulse className="h-3 flex-1" />
                <Pulse className="h-5 w-6 rounded flex-shrink-0" />
              </div>
              <div className="border-t border-slate-800" />
              {/* Equipo visitante */}
              <div className="flex justify-between items-center gap-2">
                <Pulse className="h-3 flex-1" />
                <Pulse className="h-5 w-6 rounded flex-shrink-0" />
              </div>
              {/* Hora/pista */}
              <Pulse className="h-2 w-28 mt-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Página de torneo completa ─────────────────────────────────────────────
function PaginaTorneo({ grupos = 2, rondasFinal = 3 }) {
  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 space-y-20 pt-8">
      {/* Título de sección */}
      <section>
        <div className="flex items-center gap-3 mb-8 border-l-4 border-slate-700 pl-4">
          <Pulse className="h-6 w-40" />
        </div>
        <Tabla grupos={grupos} />
      </section>
      <section>
        <div className="flex items-center gap-3 mb-10 border-l-4 border-slate-700 pl-4">
          <Pulse className="h-6 w-32" />
        </div>
        <Bracket rondas={rondasFinal} />
      </section>
    </div>
  );
}

export const Skeleton = { Pulse, Tabla, TorneosLista, Bracket, PaginaTorneo };
