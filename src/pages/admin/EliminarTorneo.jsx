import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';

export default function EliminarTorneo() {
  const [torneos,    setTorneos]    = useState([]);
  const [eliminando, setEliminando] = useState(null);
  const [mensaje,    setMensaje]    = useState({ tipo: '', texto: '' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const { data } = await supabase
      .from('torneos')
      .select('id, nombre, deporte, estado')
      .order('nombre');
    if (data) setTorneos(data);
  };

  const eliminar = async (torneo) => {
    if (!window.confirm(
      `⚠ ¿Eliminar "${torneo.nombre}"?\n\nSe borrarán todos los grupos, partidos y asignaciones.\nEsta acción NO se puede deshacer.`
    )) return;

    setEliminando(torneo.id);
    setMensaje({ tipo: '', texto: '' });

    try {
      // 1. Partidos del torneo
      const { error: e1 } = await supabase.from('partidos').delete().eq('torneo_id', torneo.id);
      if (e1) throw new Error('Error eliminando partidos: ' + e1.message);

      // 2. Grupos del torneo → obtener IDs para borrar grupo_participantes
      const { data: grupos, error: e2 } = await supabase
        .from('grupos').select('id').eq('torneo_id', torneo.id);
      if (e2) throw new Error('Error obteniendo grupos: ' + e2.message);

      if (grupos?.length > 0) {
        const { error: e3 } = await supabase
          .from('grupo_participantes')
          .delete()
          .in('grupo_id', grupos.map((g) => g.id));
        if (e3) throw new Error('Error eliminando asignaciones: ' + e3.message);
      }

      // 3. Grupos
      const { error: e4 } = await supabase.from('grupos').delete().eq('torneo_id', torneo.id);
      if (e4) throw new Error('Error eliminando grupos: ' + e4.message);

      // 4. Torneo
      const { error: e5 } = await supabase.from('torneos').delete().eq('id', torneo.id);
      if (e5) throw new Error('Error eliminando torneo: ' + e5.message);

      setMensaje({ tipo: 'ok', texto: `"${torneo.nombre}" eliminado correctamente.` });
      cargar();
    } catch (err) {
      console.error('[EliminarTorneo]', err);
      setMensaje({ tipo: 'error', texto: err.message });
    }
    setEliminando(null);
  };

  return (
    <div className="space-y-5">

      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm font-bold flex items-start gap-3">
        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
        <span>Esta acción es irreversible. Se eliminarán el torneo y todos sus datos (grupos, partidos, clasificación).</span>
      </div>

      {mensaje.texto && (
        <div className={`rounded-xl p-4 text-sm font-bold flex items-center gap-3 ${
          mensaje.tipo === 'ok'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {mensaje.tipo === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {mensaje.texto}
        </div>
      )}

      {torneos.length === 0 && (
        <p className="text-center text-slate-500 text-sm font-bold py-8 uppercase tracking-widest">
          No hay torneos registrados.
        </p>
      )}

      <div className="space-y-3">
        {torneos.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-4 bg-[#0f172a] border border-slate-700 rounded-xl p-4"
          >
            <div className="min-w-0">
              <p className="text-white font-black truncate">{t.nombre}</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                {t.deporte} · {t.estado}
              </p>
            </div>
            <button
              onClick={() => eliminar(t)}
              disabled={eliminando === t.id}
              className="flex-shrink-0 flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {eliminando === t.id
                ? <><Loader2 size={13} className="animate-spin" /> Eliminando...</>
                : <><Trash2 size={13} /> Eliminar</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
