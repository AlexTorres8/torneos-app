import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, RotateCcw, Plus, Trash2, Info, X } from 'lucide-react';
import { supabase } from '../../supabase';
import { fasesPorDefecto, filasPorDefectoFase, labelFase, ORDEN_FASES } from '../../lib/esquemasPreview';

/**
 * EditorPreviewCuadro
 *
 * Edita cómo se ve la previsualización del cuadro de fase final
 * (horas, fechas, pistas y etiquetas de equipos) mientras los partidos
 * reales de esa fase aún no existen. Se guarda en torneos.esquema_preview.
 * Los partidos reales siempre tienen prioridad sobre esta previsualización.
 */
export default function EditorPreviewCuadro() {
  const [torneos,     setTorneos]     = useState([]);
  const [torneoId,    setTorneoId]    = useState('');
  const [fases,       setFases]       = useState([]);   // [{ key, label, partidos: [{hora, ubicacion, fecha, local, visitante}] }]
  const [cargando,    setCargando]    = useState(true);
  const [cargandoTor, setCargandoTor] = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [error,       setError]       = useState('');
  const [guardadoOk,  setGuardadoOk]  = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('torneos')
        .select('id, nombre, deporte, categoria, formato, esquema_preview')
        .order('nombre');
      setTorneos(data || []);
      setCargando(false);
    })();
  }, []);

  const cargarFases = useCallback(async (t) => {
    setCargandoTor(true);
    setError('');
    setGuardadoOk(false);

    // Grupos y nº de parejas: necesarios para el esquema por defecto de pádel.
    const { data: grupos } = await supabase
      .from('grupos')
      .select('id, grupo_participantes(participantes(id))')
      .eq('torneo_id', t.id);
    const nGrupos      = grupos?.length ?? 0;
    const totalParejas = (grupos ?? []).reduce((n, g) => n + (g.grupo_participantes?.length ?? 0), 0);

    // Si hay personalización guardada, define la estructura completa (las fases
    // ausentes están quitadas). Si no, se parte del esquema por defecto.
    const guardadas = t.esquema_preview;
    if (guardadas && typeof guardadas === 'object') {
      setFases(ORDEN_FASES
        .filter((key) => Array.isArray(guardadas[key]))
        .map((key) => ({
          key,
          label: labelFase(t, key),
          partidos: guardadas[key].map((p) => ({ hora: p.hora ?? '', ubicacion: p.ubicacion ?? '', fecha: p.fecha ?? null, local: p.local ?? '', visitante: p.visitante ?? '' })),
        })));
    } else {
      setFases(fasesPorDefecto(t, { nGrupos, totalParejas }));
    }
    setCargandoTor(false);
  }, []);

  const seleccionarTorneo = (id) => {
    setTorneoId(id);
    setFases([]);
    const t = torneos.find((x) => x.id === id);
    if (t) cargarFases(t);
  };

  const setCampo = (faseIdx, partidoIdx, campo, valor) => {
    setGuardadoOk(false);
    setFases((prev) => prev.map((f, fi) =>
      fi !== faseIdx ? f : {
        ...f,
        partidos: f.partidos.map((p, pi) => pi !== partidoIdx ? p : { ...p, [campo]: valor }),
      }
    ));
  };

  const anadirFase = (key) => {
    setGuardadoOk(false);
    const t = torneos.find((x) => x.id === torneoId);
    setFases((prev) => {
      if (prev.some((f) => f.key === key)) return prev;
      const nueva = { key, label: labelFase(t, key), partidos: filasPorDefectoFase(t, key) };
      // Insertar en su posición canónica (playoffs → cuartos → semis → final).
      return [...prev, nueva].sort((a, b) => ORDEN_FASES.indexOf(a.key) - ORDEN_FASES.indexOf(b.key));
    });
  };

  const quitarFase = (key) => {
    setGuardadoOk(false);
    setFases((prev) => prev.filter((f) => f.key !== key));
  };

  const anadirPartido = (faseIdx) => {
    setGuardadoOk(false);
    setFases((prev) => prev.map((f, fi) =>
      fi !== faseIdx ? f : { ...f, partidos: [...f.partidos, { hora: '', ubicacion: '', fecha: null, local: '', visitante: '' }] }
    ));
  };

  const quitarPartido = (faseIdx, partidoIdx) => {
    setGuardadoOk(false);
    setFases((prev) => prev.map((f, fi) =>
      fi !== faseIdx ? f : { ...f, partidos: f.partidos.filter((_, pi) => pi !== partidoIdx) }
    ));
  };

  const guardar = async () => {
    setGuardando(true);
    setError('');
    const esquema = Object.fromEntries(fases.map((f) => [
      f.key,
      f.partidos.map((p) => ({
        hora: p.hora.trim(), ubicacion: p.ubicacion.trim(), fecha: p.fecha || null,
        local: p.local.trim(), visitante: p.visitante.trim(),
      })),
    ]));
    const { error: e } = await supabase
      .from('torneos')
      .update({ esquema_preview: esquema })
      .eq('id', torneoId);
    setGuardando(false);
    if (e) { setError('Error al guardar: ' + e.message); return; }
    setTorneos((prev) => prev.map((t) => t.id === torneoId ? { ...t, esquema_preview: esquema } : t));
    setGuardadoOk(true);
    setTimeout(() => setGuardadoOk(false), 2500);
  };

  const restaurar = async () => {
    if (!window.confirm('¿Restaurar la previsualización por defecto? Se borrará la personalización guardada de este torneo.')) return;
    setGuardando(true);
    setError('');
    const { error: e } = await supabase
      .from('torneos')
      .update({ esquema_preview: null })
      .eq('id', torneoId);
    setGuardando(false);
    if (e) { setError('Error al restaurar: ' + e.message); return; }
    const t = { ...torneos.find((x) => x.id === torneoId), esquema_preview: null };
    setTorneos((prev) => prev.map((x) => x.id === torneoId ? t : x));
    cargarFases(t);
  };

  if (cargando) return (
    <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">
      Cargando torneos...
    </p>
  );

  if (!torneos.length) return (
    <p className="text-slate-600 text-xs font-black uppercase tracking-widest">
      No hay torneos creados.
    </p>
  );

  const torneoSel = torneos.find((t) => t.id === torneoId);

  return (
    <div className="space-y-6">

      {/* Aviso */}
      <div className="flex items-start gap-3 bg-[#60A5FA]/10 border border-[#60A5FA]/30 rounded-xl p-4 text-[#60A5FA] text-sm font-bold">
        <Info size={17} className="flex-shrink-0 mt-0.5" />
        <span>
          Esto solo cambia la <b>previsualización</b> del cuadro (lo que se ve antes de crear
          los partidos reales de cada fase). Los partidos reales siempre tienen prioridad.
        </span>
      </div>

      {/* Selector de torneo */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Torneo</label>
        <select
          value={torneoId}
          onChange={(e) => seleccionarTorneo(e.target.value)}
          className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-[#60A5FA] outline-none transition-colors [&>option]:bg-[#0f172a]"
        >
          <option value="">— Selecciona torneo —</option>
          {torneos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}{t.esquema_preview ? ' · personalizado' : ''}
            </option>
          ))}
        </select>
      </div>

      {cargandoTor && (
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">
          Cargando esquema...
        </p>
      )}

      {/* Fases del cuadro: añadir / quitar */}
      {torneoSel && !cargandoTor && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Fases del cuadro
          </p>
          <div className="flex flex-wrap gap-2">
            {ORDEN_FASES.map((key) => {
              const presente = fases.some((f) => f.key === key);
              return presente ? (
                <button
                  key={key}
                  onClick={() => quitarFase(key)}
                  title="Quitar fase de la previsualización"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border bg-[#60A5FA]/20 border-[#60A5FA]/60 text-[#60A5FA] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 transition-all"
                >
                  {labelFase(torneoSel, key)} <X size={11} />
                </button>
              ) : (
                <button
                  key={key}
                  onClick={() => anadirFase(key)}
                  title="Añadir fase a la previsualización"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border border-dashed bg-slate-800/40 border-slate-600 text-slate-500 hover:text-white hover:border-slate-400 transition-all"
                >
                  <Plus size={11} /> {labelFase(torneoSel, key)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fases editables */}
      {torneoSel && !cargandoTor && fases.map((fase, fi) => (
        <div key={fase.key} className="bg-[#0f172a] border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#60A5FA] font-black uppercase tracking-widest text-sm">{fase.label}</h3>
            <button
              onClick={() => anadirPartido(fi)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
            >
              <Plus size={11} /> Partido
            </button>
          </div>

          <div className="space-y-3">
            {fase.partidos.map((p, pi) => (
              <div key={pi} className="bg-[#1e293b]/60 border border-slate-700/40 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_auto] gap-3 mb-3">
                  <input
                    value={p.local}
                    onChange={(e) => setCampo(fi, pi, 'local', e.target.value)}
                    maxLength={40}
                    placeholder="Local (ej: 1º Grupo A)"
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-[#60A5FA] outline-none transition-colors"
                  />
                  <input
                    value={p.visitante}
                    onChange={(e) => setCampo(fi, pi, 'visitante', e.target.value)}
                    maxLength={40}
                    placeholder="Visitante (ej: 2º Grupo B)"
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-[#60A5FA] outline-none transition-colors"
                  />
                  <button
                    onClick={() => quitarPartido(fi, pi)}
                    title="Eliminar partido"
                    className="col-span-2 md:col-span-1 flex items-center justify-center text-slate-600 hover:text-red-400 px-2 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={p.fecha || ''}
                    onChange={(e) => setCampo(fi, pi, 'fecha', e.target.value || null)}
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:border-[#60A5FA] outline-none transition-colors [color-scheme:dark]"
                  />
                  <input
                    value={p.hora}
                    onChange={(e) => setCampo(fi, pi, 'hora', e.target.value)}
                    maxLength={12}
                    placeholder="Hora (20:00)"
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:border-[#60A5FA] outline-none transition-colors"
                  />
                  <input
                    value={p.ubicacion}
                    onChange={(e) => setCampo(fi, pi, 'ubicacion', e.target.value)}
                    maxLength={30}
                    placeholder={torneoSel.deporte === 'padel' ? 'Pista 1' : 'Pabellón'}
                    list={`pistas-${torneoSel.deporte}`}
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:border-[#60A5FA] outline-none transition-colors"
                  />
                </div>
              </div>
            ))}
            {fase.partidos.length === 0 && (
              <p className="text-slate-600 text-xs font-bold italic">Sin partidos — esta fase no se previsualizará.</p>
            )}
          </div>
        </div>
      ))}

      {/* Sugerencias de pistas */}
      <datalist id="pistas-padel">
        <option value="Pista 1" /><option value="Pista 2" />
      </datalist>
      <datalist id="pistas-futsal">
        <option value="Pabellón" /><option value="Pista Ext." /><option value="Pista Exterior" />
      </datalist>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-xs font-bold">
          <AlertCircle size={13} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Acciones */}
      {torneoSel && !cargandoTor && (
        <div className="flex gap-3">
          <button
            onClick={restaurar}
            disabled={guardando}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white font-black uppercase tracking-widest py-2.5 px-4 rounded-xl text-xs transition-all disabled:opacity-50"
          >
            <RotateCcw size={12} /> Restaurar por defecto
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex-1 flex items-center justify-center gap-2 bg-[#60A5FA] hover:bg-blue-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-2.5 rounded-xl text-xs transition-all"
          >
            {guardando
              ? <><Loader2 size={12} className="animate-spin" /> Guardando...</>
              : guardadoOk
              ? <><CheckCircle2 size={12} /> Guardado</>
              : <><Save size={12} /> Guardar previsualización</>}
          </button>
        </div>
      )}
    </div>
  );
}
