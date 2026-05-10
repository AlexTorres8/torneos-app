import { useState, useEffect } from 'react';
import { Filter, CheckCircle, AlertCircle, RefreshCw, Pencil, X, Save } from 'lucide-react';
import { supabase } from '../../supabase';
import { HoraUbicacionPicker } from '../../components/ui/HoraUbicacionPicker';
import { validarResultadoPadel } from '../../lib/validarPadel';
import { sanitizarDetalle } from '../../lib/sanitize';

export default function PartidosFinalizados({ torneos }) {
  const [partidos,     setPartidos]     = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [filtroTorneo, setFiltroTorneo] = useState('');

  // Estado de edición
  const [editando,     setEditando]     = useState(null); // id del partido en edición
  const [editHora,     setEditHora]     = useState('');
  const [editUbic,     setEditUbic]     = useState('');
  const [editL,        setEditL]        = useState('');
  const [editV,        setEditV]        = useState('');
  const [editDetalle,  setEditDetalle]  = useState('');
  const [guardando,    setGuardando]    = useState(null);
  const [errEdit,      setErrEdit]      = useState({});

  const cargar = async () => {
    setCargando(true);
    setErrorMsg('');

    let q = supabase
      .from('partidos')
      .select(
        'id, fase, jornada, hora, ubicacion, ' +
        'puntuacion_local, puntuacion_visitante, detalle_resultado, torneo_id, ' +
        'torneo:torneos(nombre, deporte), ' +
        'local:participantes!local_id(nombre), ' +
        'visitante:participantes!visitante_id(nombre)'
      )
      .eq('estado', 'finalizado');

    if (filtroTorneo) q = q.eq('torneo_id', filtroTorneo);

    q = q.order('jornada', { ascending: false }).limit(100);

    const { data, error } = await q;

    if (error) {
      console.error('[PartidosFinalizados]', error);
      setErrorMsg(error.message);
      setPartidos([]);
    } else {
      setPartidos(data || []);
    }
    setCargando(false);
  };

  useEffect(() => { cargar(); }, [filtroTorneo]);

  // ── Abrir editor ────────────────────────────────────────────────────────
  const abrirEdicion = (p) => {
    setEditando(p.id);
    setEditHora(p.hora || '');
    setEditUbic(p.ubicacion || '');
    setEditL(String(p.puntuacion_local ?? ''));
    setEditV(String(p.puntuacion_visitante ?? ''));
    setEditDetalle(p.detalle_resultado || '');
    setErrEdit((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
  };

  const cancelarEdicion = () => setEditando(null);

  // ── Guardar ─────────────────────────────────────────────────────────────
  const guardar = async (p) => {
    const esPadel = p.torneo?.deporte === 'padel';
    const lNum    = parseInt(editL);
    const vNum    = parseInt(editV);
    const detalle = sanitizarDetalle(editDetalle);

    // Validación
    if (isNaN(lNum) || isNaN(vNum) || lNum < 0 || vNum < 0) {
      setErrEdit((prev) => ({ ...prev, [p.id]: 'Introduce marcadores válidos.' }));
      return;
    }
    if (esPadel && detalle) {
      const { ok, error } = validarResultadoPadel(editL, editV, detalle);
      if (!ok) { setErrEdit((prev) => ({ ...prev, [p.id]: error })); return; }
    }

    setGuardando(p.id);
    setErrEdit((prev) => { const n = { ...prev }; delete n[p.id]; return n; });

    const payload = {
      hora:               editHora  || null,
      ubicacion:          editUbic  || null,
      puntuacion_local:   lNum,
      puntuacion_visitante: vNum,
      detalle_resultado:  esPadel ? (detalle || null) : null,
    };

    const { error } = await supabase.from('partidos').update(payload).eq('id', p.id);

    if (error) {
      setErrEdit((prev) => ({ ...prev, [p.id]: 'Error al guardar: ' + error.message }));
    } else {
      // Actualiza en local para no recargar todo
      setPartidos((prev) =>
        prev.map((x) =>
          x.id === p.id
            ? { ...x, ...payload, hora: editHora || null, ubicacion: editUbic || null }
            : x
        )
      );
      setEditando(null);
    }
    setGuardando(null);
  };

  const faseLabel = (fase) =>
    ({ grupos: 'Grupos', cuartos: 'Cuartos', semis: 'Semifinales', final: 'Final', playoffs: 'Previa' })[fase] ?? fase;

  return (
    <div className="space-y-4">

      {/* Filtro por torneo */}
      {torneos.length > 1 && (
        <div className="flex items-center gap-3 bg-[#0f172a]/60 border border-slate-700/50 rounded-xl p-3">
          <Filter size={14} className="text-slate-500 flex-shrink-0" />
          <select
            value={filtroTorneo}
            onChange={(e) => setFiltroTorneo(e.target.value)}
            className="flex-1 bg-[#0f172a] text-white font-bold text-sm focus:outline-none cursor-pointer [&>option]:bg-[#0f172a]"
          >
            <option value="">Todos los torneos</option>
            {torneos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* Cargando */}
      {cargando && (
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center py-8 animate-pulse">
          Cargando resultados...
        </p>
      )}

      {/* Error de carga */}
      {!cargando && errorMsg && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm font-bold">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={cargar}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            <RefreshCw size={12} /> Reintentar
          </button>
        </div>
      )}

      {/* Sin resultados */}
      {!cargando && !errorMsg && partidos.length === 0 && (
        <p className="text-center text-slate-500 text-sm font-bold py-8 uppercase tracking-widest">
          No hay resultados finalizados.
        </p>
      )}

      {/* Lista */}
      {!cargando && !errorMsg && partidos.length > 0 && (
        <div className="space-y-2">
          {partidos.map((p) => {
            const esPadel   = p.torneo?.deporte === 'padel';
            const enEdicion = editando === p.id;
            const estaGuardando = guardando === p.id;

            return (
              <div
                key={p.id}
                className={`bg-[#0f172a] border rounded-xl transition-colors ${
                  enEdicion ? 'border-[#60A5FA]/50' : 'border-slate-700/50'
                }`}
              >
                {/* Cabecera siempre visible */}
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        {p.torneo?.nombre}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#60A5FA] bg-[#60A5FA]/10 px-2 py-0.5 rounded">
                        {faseLabel(p.fase)}
                      </span>
                      {p.hora && (
                        <span className="text-[9px] text-slate-500 font-bold">{p.hora}</span>
                      )}
                      {p.ubicacion && (
                        <span className="text-[9px] text-slate-500 font-bold">· {p.ubicacion}</span>
                      )}
                    </div>
                    <p className="text-white font-bold text-sm truncate">
                      {p.local?.nombre} <span className="text-slate-500">vs</span> {p.visitante?.nombre}
                    </p>
                    {p.detalle_resultado && !enEdicion && (
                      <p className="text-slate-500 text-[10px] font-mono mt-0.5">{p.detalle_resultado}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!enEdicion && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-2xl font-black text-white tabular-nums">{p.puntuacion_local}</span>
                          <span className="text-slate-600 font-black text-lg">-</span>
                          <span className="text-2xl font-black text-white tabular-nums">{p.puntuacion_visitante}</span>
                        </div>
                        <CheckCircle size={14} className="text-emerald-500" />
                        <button
                          onClick={() => abrirEdicion(p)}
                          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
                        >
                          <Pencil size={11} /> Editar
                        </button>
                      </>
                    )}

                    {enEdicion && (
                      <button
                        onClick={cancelarEdicion}
                        className="text-slate-500 hover:text-white transition-colors p-1"
                        aria-label="Cancelar edición"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Panel de edición expandible */}
                {enEdicion && (
                  <div className="border-t border-slate-700/60 p-4 space-y-4">

                    {/* Hora y ubicación */}
                    <HoraUbicacionPicker
                      hora={editHora}
                      ubicacion={editUbic}
                      deporte={p.torneo?.deporte ?? 'futsal'}
                      onHora={setEditHora}
                      onUbicacion={setEditUbic}
                    />

                    {/* Resultado */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                        {esPadel ? 'Sets' : 'Marcador'}
                      </p>
                      <div className="flex items-end gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[80px]">
                            {p.local?.nombre}
                          </span>
                          <input
                            type="number" min="0" max={esPadel ? 2 : 99}
                            value={editL}
                            onChange={(e) => { setEditL(e.target.value); setErrEdit((x) => { const n={...x}; delete n[p.id]; return n; }); }}
                            className="w-16 h-12 bg-black border border-slate-600 rounded-lg text-center text-white text-2xl font-black focus:border-[#60A5FA] outline-none"
                          />
                        </div>
                        <span className="text-slate-500 font-black text-2xl pb-3">-</span>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[80px]">
                            {p.visitante?.nombre}
                          </span>
                          <input
                            type="number" min="0" max={esPadel ? 2 : 99}
                            value={editV}
                            onChange={(e) => { setEditV(e.target.value); setErrEdit((x) => { const n={...x}; delete n[p.id]; return n; }); }}
                            className="w-16 h-12 bg-black border border-slate-600 rounded-lg text-center text-white text-2xl font-black focus:border-[#60A5FA] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Detalle sets (solo pádel) */}
                    {esPadel && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                          Detalle de sets <span className="text-slate-600 normal-case font-normal">(para desempate)</span>
                        </label>
                        <input
                          type="text"
                          value={editDetalle}
                          onChange={(e) => { setEditDetalle(e.target.value); setErrEdit((x) => { const n={...x}; delete n[p.id]; return n; }); }}
                          placeholder="Ej: 6-4, 4-6, 7-6"
                          maxLength={30}
                          className="w-full bg-black border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:border-amber-500 outline-none"
                        />
                      </div>
                    )}

                    {/* Error de validación */}
                    {errEdit[p.id] && (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-xs font-bold">
                        <AlertCircle size={13} className="flex-shrink-0" /> {errEdit[p.id]}
                      </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={cancelarEdicion}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-all"
                      >
                        <X size={13} /> Cancelar
                      </button>
                      <button
                        onClick={() => guardar(p)}
                        disabled={estaGuardando}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#60A5FA] hover:bg-blue-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-all"
                      >
                        {estaGuardando
                          ? <><div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Guardando...</>
                          : <><Save size={13} /> Guardar cambios</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
