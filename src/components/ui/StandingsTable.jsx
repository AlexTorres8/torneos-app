/**
 * Tabla de clasificación reutilizable.
 * variant: 'futsal' | 'padel' | 'futsal24h'
 *
 * Recibe `equipos` ya ordenados con su objeto `stats` adjunto.
 */
export function StandingsTable({ grupo, equipos, variant = 'futsal' }) {
  const accentColor = variant === 'futsal24h' ? 'text-amber-500' : 'text-blue-400';
  const headerBorder = variant === 'futsal24h' ? 'text-amber-500' : 'text-blue-400';

  return (
    <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800 shadow-lg">
      <div className={`bg-gradient-to-r from-black/40 to-transparent px-4 py-3 text-xs font-black uppercase tracking-widest border-b border-slate-800 ${headerBorder}`}>
        {grupo.nombre}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead className="bg-[#0f172a]/50 uppercase font-bold text-slate-500">
            <tr>
              <th className="px-3 py-2 text-center">#</th>
              <th className="px-3 py-2">Equipo</th>
              <th className="px-3 py-2 text-center text-white">Pts</th>
              <th className="px-2 py-2 text-center">PJ</th>

              {/* Columnas específicas por variante */}
              {variant === 'futsal' && (
                <>
                  <th className="px-2 py-2 text-center text-emerald-500/70">PG</th>
                  <th className="px-2 py-2 text-center text-amber-500/70">PE</th>
                  <th className="px-2 py-2 text-center text-red-500/70">PP</th>
                  <th className="px-2 py-2 text-center text-slate-400">GF</th>
                  <th className="px-2 py-2 text-center text-slate-400">GC</th>
                </>
              )}

              {variant === 'padel' && (
                <>
                  <th className="px-2 py-2 text-center text-emerald-500/70" title="Sets a Favor">SF</th>
                  <th className="px-2 py-2 text-center text-red-500/70" title="Sets en Contra">SC</th>
                </>
              )}

              {variant === 'futsal24h' && (
                <>
                  <th className="px-2 py-2 text-center text-slate-400">GF</th>
                  <th className="px-2 py-2 text-center text-slate-400">GC</th>
                </>
              )}

              <th className="px-2 py-2 text-center text-slate-300">+/-</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {equipos.map((e, index) => {
              // En 24h clasifican los 2 primeros (resaltado verde)
              const clasificado =
                variant === 'futsal24h' ? index < 2 : false;

              return (
                <tr
                  key={e.id}
                  className={`hover:bg-white/5 transition-colors ${clasificado ? 'bg-emerald-500/5' : ''}`}
                >
                  <td className="px-3 py-2 text-center font-bold">
                    <span className={clasificado ? 'text-emerald-500' : 'text-slate-600'}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-bold text-white max-w-[120px] truncate">
                    <div className="flex items-center gap-2">
                      {index === 0 && e.stats.pts > 0 && (
                        <span className="text-yellow-500">👑</span>
                      )}
                      {e.nombre}
                    </div>
                  </td>
                  <td className={`px-3 py-2 text-center font-black text-[13px] ${accentColor}`}>
                    {e.stats.pts}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-400">{e.stats.pj}</td>

                  {variant === 'futsal' && (
                    <>
                      <td className="px-2 py-2 text-center text-emerald-500/70">{e.stats.pg}</td>
                      <td className="px-2 py-2 text-center text-amber-500/70">{e.stats.pe}</td>
                      <td className="px-2 py-2 text-center text-red-500/70">{e.stats.pp}</td>
                      <td className="px-2 py-2 text-center text-slate-400">{e.stats.gf}</td>
                      <td className="px-2 py-2 text-center text-slate-400">{e.stats.gc}</td>
                    </>
                  )}

                  {variant === 'padel' && (
                    <>
                      <td className="px-2 py-2 text-center text-emerald-500/70">{e.stats.gf}</td>
                      <td className="px-2 py-2 text-center text-red-500/70">{e.stats.gc}</td>
                    </>
                  )}

                  {variant === 'futsal24h' && (
                    <>
                      <td className="px-2 py-2 text-center text-slate-400">{e.stats.gf}</td>
                      <td className="px-2 py-2 text-center text-slate-400">{e.stats.gc}</td>
                    </>
                  )}

                  <td
                    className={`px-2 py-2 text-center font-bold ${
                      e.stats.dif > 0
                        ? 'text-emerald-500'
                        : e.stats.dif < 0
                        ? 'text-red-500'
                        : 'text-slate-500'
                    }`}
                  >
                    {e.stats.dif > 0 ? `+${e.stats.dif}` : e.stats.dif}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
