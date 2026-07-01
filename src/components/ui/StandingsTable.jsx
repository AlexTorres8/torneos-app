/**
 * StandingsTable — Tabla de clasificación reutilizable.
 * variant: 'futsal' | 'padel' | 'futsal24h'
 *
 * Para pádel muestra: Pts · PJ · SF · SC · JF · JC · +/- sets
 * El desempate real (partido directo) se resuelve en el padre;
 * aquí solo se muestran los datos que permiten al usuario entenderlo.
 */
export function StandingsTable({ grupo, equipos, variant = 'futsal' }) {
  const accentColor  = variant === 'futsal24h' ? 'text-amber-500' : 'text-blue-400';
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
                  <th className="px-2 py-2 text-center text-red-500/70"     title="Sets en Contra">SC</th>
                  <th className="px-2 py-2 text-center text-slate-400"      title="Juegos a Favor">JF</th>
                  <th className="px-2 py-2 text-center text-slate-400"      title="Juegos en Contra">JC</th>
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
              const clasificado = variant === 'futsal24h' ? index < 2 : false;
              const esLider     = index === 0 && e.stats.pts > 0;

              return (
                <tr
                  key={e.id}
                  className={`hover:bg-white/5 transition-colors ${clasificado ? 'bg-emerald-500/5' : ''}`}
                >
                  <td className="px-3 py-2 text-center font-bold">
                    <span className={clasificado ? 'text-emerald-500' : 'text-slate-600'}>{index + 1}</span>
                  </td>
                  <td className="px-3 py-2 font-bold text-white max-w-[120px] truncate">
                    <div className="flex items-center gap-2">
                      {esLider && <span className="text-yellow-500">👑</span>}
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
                      {/* Juegos a favor / en contra — desempate de 3er nivel */}
                      <td className="px-2 py-2 text-center text-slate-400" title="Juegos a favor">
                        {e.stats.jf ?? '—'}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400" title="Juegos en contra">
                        {e.stats.jc ?? '—'}
                      </td>
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
                      e.stats.dif > 0 ? 'text-emerald-500' : e.stats.dif < 0 ? 'text-red-500' : 'text-slate-500'
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

      {/* Leyenda desempate */}
      {variant === 'padel' && (
        <div className="px-4 py-2 border-t border-slate-800/60 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
          Desempate: 1. Pts · 2. Partido directo · 3. Set avg (SF/SC) · 4. Juego avg (JF/JC)
        </div>
      )}
      {(variant === 'futsal' || variant === 'futsal24h') && (
        <div className="px-4 py-2 border-t border-slate-800/60 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
          Desempate: 1. Pts · 2. Partido directo · 3. Dif. goles · 4. Goles a favor
        </div>
      )}
    </div>
  );
}
