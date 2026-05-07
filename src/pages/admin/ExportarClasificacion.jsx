import { useState, useEffect } from 'react';
import { Copy, CheckCircle2, MessageCircle } from 'lucide-react';
import { supabase } from '../../supabase';
import { calcularStats } from '../../hooks/useCalcStats';

/**
 * Genera un texto con la clasificación de un torneo
 * listo para pegar en WhatsApp.
 *
 * CORRECCIÓN: useState(() => {}, []) no funciona como useEffect.
 * La carga inicial de torneos ahora usa useEffect correctamente.
 */
export default function ExportarClasificacion() {
  const [torneos,   setTorneos]   = useState([]);
  const [torneoId,  setTorneoId]  = useState('');
  const [texto,     setTexto]     = useState('');
  const [copiado,   setCopiado]   = useState(false);
  const [cargando,  setCargando]  = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');

  // ── CORRECCIÓN: useEffect (no useState) para cargar torneos al montar ──
  useEffect(() => {
    supabase
      .from('torneos')
      .select('id, nombre, deporte')
      .order('nombre')
      .then(({ data, error }) => {
        if (error) {
          console.error('[ExportarClasificacion] Error cargando torneos:', error.message);
          return;
        }
        if (data) setTorneos(data);
      });
  }, []);

  const generarTexto = async () => {
    if (!torneoId) return;
    setCargando(true);
    setTexto('');
    setErrorMsg('');

    try {
      const torneo = torneos.find((t) => t.id === torneoId);

      const [{ data: grupos, error: e1 }, { data: partidos, error: e2 }] = await Promise.all([
        supabase
          .from('grupos')
          .select('id, nombre, grupo_participantes(participantes(id, nombre))')
          .eq('torneo_id', torneoId),
        supabase
          .from('partidos')
          .select('id, fase, estado, local_id, visitante_id, puntuacion_local, puntuacion_visitante')
          .eq('torneo_id', torneoId),
      ]);

      if (e1) throw new Error('Error cargando grupos: ' + e1.message);
      if (e2) throw new Error('Error cargando partidos: ' + e2.message);
      if (!grupos || !partidos) throw new Error('No se pudieron cargar los datos.');

      const deporte = torneo?.deporte || 'futsal';
      const lineas  = [];

      lineas.push(`🏆 *${torneo?.nombre?.toUpperCase()}*`);
      lineas.push(`📊 Clasificación\n`);

      grupos.forEach((g) => {
        const equipos = g.grupo_participantes
          .map((gp) => ({
            ...gp.participantes,
            stats: calcularStats(partidos, gp.participantes.id, deporte),
          }))
          .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf);

        lineas.push(`*── ${g.nombre} ──*`);

        equipos.forEach((e, i) => {
          const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          const pts     = String(e.stats.pts).padStart(2, ' ');
          const pj      = String(e.stats.pj).padStart(2, ' ');
          const dif     = e.stats.dif > 0 ? `+${e.stats.dif}` : String(e.stats.dif);
          lineas.push(`${medalla} ${e.nombre.padEnd(22)} ${pts}pts  PJ${pj}  (${dif})`);
        });

        lineas.push('');
      });

      // Resultados recientes (últimos 5 finalizados)
      const finalizados = partidos
        .filter((p) => p.estado === 'finalizado' && p.fase === 'grupos')
        .slice(-5);

      if (finalizados.length > 0) {
        const ids = [...new Set(finalizados.flatMap((p) => [p.local_id, p.visitante_id]))];
        const { data: parts, error: e3 } = await supabase
          .from('participantes')
          .select('id, nombre')
          .in('id', ids);

        if (e3) throw new Error('Error cargando participantes: ' + e3.message);

        const nombrePor = (id) => parts?.find((p) => p.id === id)?.nombre || '?';

        lineas.push(`*── Últimos resultados ──*`);
        finalizados.forEach((p) => {
          lineas.push(`${nombrePor(p.local_id)} ${p.puntuacion_local} - ${p.puntuacion_visitante} ${nombrePor(p.visitante_id)}`);
        });
        lineas.push('');
      }

      lineas.push(`_Actualizado desde activafitness.es_`);

      setTexto(lineas.join('\n'));
    } catch (err) {
      console.error('[ExportarClasificacion]', err);
      setErrorMsg(err.message || 'Error generando la clasificación.');
    } finally {
      setCargando(false);
    }
  };

  const copiar = async () => {
    if (!texto) return;
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="space-y-5">

      {/* Selector torneo */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
          Torneo
        </label>
        <div className="flex gap-3">
          <select
            value={torneoId}
            onChange={(e) => { setTorneoId(e.target.value); setTexto(''); setErrorMsg(''); }}
            className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-[#60A5FA] outline-none transition-colors"
          >
            <option value="">— Selecciona un torneo —</option>
            {torneos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
          <button
            onClick={generarTexto}
            disabled={!torneoId || cargando}
            className="bg-[#60A5FA] hover:bg-blue-400 disabled:opacity-40 text-black font-black uppercase tracking-widest px-5 rounded-xl transition-all flex items-center gap-2 text-xs whitespace-nowrap"
          >
            {cargando
              ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : <MessageCircle size={16} />}
            Generar
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm font-bold">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Texto generado */}
      {texto && (
        <>
          <div className="relative">
            <textarea
              readOnly
              value={texto}
              rows={14}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-slate-300 font-mono text-xs resize-none focus:outline-none"
            />
          </div>

          <button
            onClick={copiar}
            className={`w-full font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg ${
              copiado
                ? 'bg-emerald-600 text-white'
                : 'bg-[#60A5FA] hover:bg-blue-400 text-black shadow-[0_0_20px_rgba(96,165,250,0.2)]'
            }`}
          >
            {copiado
              ? <><CheckCircle2 size={18} /> ¡Copiado al portapapeles!</>
              : <><Copy size={18} /> Copiar para WhatsApp</>}
          </button>
        </>
      )}
    </div>
  );
}
