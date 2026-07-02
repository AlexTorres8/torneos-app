import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { supabase } from '../../supabase';

/**
 * Sección pública con las sanciones (tarjetas / expulsiones) de un torneo.
 * No renderiza nada si el torneo no tiene sanciones registradas.
 */
export function SancionesTorneo({ torneoId, accent = 'blue' }) {
  const [sanciones, setSanciones] = useState([]);

  useEffect(() => {
    if (!torneoId) return;
    let vivo = true;
    supabase
      .from('sanciones')
      .select('id, jugador, tipo, partidos_sancion, motivo, participantes(nombre)')
      .eq('torneo_id', torneoId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (vivo && data) setSanciones(data); });
    return () => { vivo = false; };
  }, [torneoId]);

  if (sanciones.length === 0) return null;

  const color = accent === 'amber' ? 'text-amber-500 border-amber-500' : 'text-blue-400 border-blue-500';

  return (
    <section>
      <h2 className={`text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 pl-4 flex items-center gap-3 ${color.split(' ')[1]}`}>
        <ShieldAlert className={color.split(' ')[0]} /> Sanciones
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap bg-[#1e293b] rounded-xl overflow-hidden shadow-xl border border-slate-700">
          <thead className="bg-[#0f172a] uppercase font-black text-slate-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-center">Tarjeta</th>
              <th className="px-4 py-3">Jugador</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3 text-center">Sanción</th>
              <th className="px-4 py-3">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-200">
            {sanciones.map((s) => (
              <tr key={s.id} className={s.tipo === 'roja' ? 'bg-red-500/5' : ''}>
                <td className="px-4 py-3 text-center text-lg">{s.tipo === 'roja' ? '🟥' : '🟨'}</td>
                <td className="px-4 py-3 font-black text-white">{s.jugador}</td>
                <td className="px-4 py-3 text-slate-400 font-bold">{s.participantes?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-center font-bold">
                  {s.partidos_sancion > 0
                    ? <span className="text-red-400">{s.partidos_sancion} partido{s.partidos_sancion > 1 ? 's' : ''}</span>
                    : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.motivo || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
