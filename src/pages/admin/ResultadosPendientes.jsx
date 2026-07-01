import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../supabase';
import { validarResultadoPadel } from '../../lib/validarPadel';
import { HoraUbicacionPicker } from '../../components/ui/HoraUbicacionPicker';
import { sanitizarDetalle } from '../../lib/sanitize';
import { checkRateLimit } from '../../lib/rateLimit';

export default function ResultadosPendientes({ partidos, onActualizar }) {
  const [editando,      setEditando]      = useState(null);
  const [editHora,      setEditHora]      = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');
  const [confirmando,   setConfirmando]   = useState(null);
  const [errores,       setErrores]       = useState({});
  const [finalizados,   setFinalizados]   = useState([]);
  const [verFinalizados,setVerFinalizados]= useState(false);
  const [cargandoFin,   setCargandoFin]   = useState(false);
  const [guardando,     setGuardando]     = useState(null);

  const setError   = (id, msg) => setErrores((p) => ({ ...p, [id]: msg }));
  const clearError = (id)      => setErrores((p) => { const n = { ...p }; delete n[id]; return n; });

  useEffect(() => {
    if (!verFinalizados) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargandoFin(true);
    const torneoIds = [...new Set(partidos.map((p) => p.torneo_id).filter(Boolean))];
    const q = supabase
      .from('partidos')
      .select('id, fase, jornada, hora, ubicacion, estado, puntuacion_local, puntuacion_visitante, detalle_resultado, torneo:torneos(nombre, deporte), local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre), torneo_id')
      .eq('estado', 'finalizado')
      .order('updated_at', { ascending: false })
      .limit(20);
    if (torneoIds.length > 0) q.in('torneo_id', torneoIds);
    q.then(({ data, error }) => {
      if (!error && data) setFinalizados(data);
      setCargandoFin(false);
    });
  }, [verFinalizados, partidos]);

  const pedirConfirmacion = (id, l, v, detalle, esPadel) => {
    clearError(id);
    const { ok: rlOk, resetIn } = checkRateLimit('guardar-resultado', 20, 60_000);
    if (!rlOk) { setError(id, `Demasiadas peticiones. Espera ${resetIn}s.`); return; }

    const detalleClean = detalle ? sanitizarDetalle(detalle) : null;
    if (esPadel) {
      const { ok, error } = validarResultadoPadel(l, v, detalleClean);
      if (!ok) { setError(id, error); return; }
    } else if (isNaN(parseInt(l)) || isNaN(parseInt(v)) || parseInt(l) < 0 || parseInt(v) < 0) {
      setError(id, 'Introduce marcadores válidos.');
      return;
    }
    setConfirmando({ id, l, v, detalle: detalleClean, esPadel });
  };

  const guardarConfirmado = async () => {
    if (!confirmando) return;
    const { id, l, v, detalle } = confirmando;
    setConfirmando(null);
    setGuardando(id);
    const payload = { puntuacion_local: parseInt(l), puntuacion_visitante: parseInt(v), estado: 'finalizado' };
    if (detalle) payload.detalle_resultado = detalle;
    const { error } = await supabase.from('partidos').update(payload).eq('id', id);
    setGuardando(null);
    if (error) { setError(id, 'Error al guardar: ' + error.message); return; }
    onActualizar();
  };

  const iniciarEdicion = (p) => {
    setEditando(p.id);
    setEditHora(p.hora || '');
    setEditUbicacion(p.ubicacion || '');
  };

  const guardarEdicion = async (id) => {
    if (editHora && editUbicacion) {
      const actual = partidos.find(p => p.id === id);
      const conflicto = partidos.find(p =>
        p.id !== id &&
        p.torneo_id === actual?.torneo_id &&
        p.jornada  === actual?.jornada &&
        p.hora     === editHora &&
        p.ubicacion === editUbicacion
      );
      if (conflicto) {
        setError(id, `Conflicto: ${conflicto.local?.nombre} vs ${conflicto.visitante?.nombre} ya ocupa ${editHora} en ${editUbicacion} (Jornada ${conflicto.jornada}).`);
        return;
      }
    }
    const { error } = await supabase.from('partidos').update({ hora: editHora || null, ubicacion: editUbicacion || null }).eq('id', id);
    if (error) { setError(id, 'Error al guardar.'); return; }
    setEditando(null);
    onActualizar();
  };

  const corregirResultado = async (id, l, v, detalle, esPadel) => {
    if (esPadel) {
      const { ok, error } = validarResultadoPadel(l, v, detalle);
      if (!ok) { setError(id, error); return; }
    }
    const lNum = parseInt(l), vNum = parseInt(v);
    if (isNaN(lNum) || isNaN(vNum)) { setError(id, 'Marcadores inválidos.'); return; }
    if (!window.confirm(`⚠ ¿Corregir el resultado a ${lNum} - ${vNum}?\nEsta acción actualiza la clasificación pública.`)) return;
    const payload = { puntuacion_local: lNum, puntuacion_visitante: vNum };
    if (detalle !== undefined) payload.detalle_resultado = detalle || null;
    const { error } = await supabase.from('partidos').update(payload).eq('id', id);
    if (error) { setError(id, 'Error: ' + error.message); return; }
    setVerFinalizados(false);
    setTimeout(() => setVerFinalizados(true), 50);
    onActualizar();
  };

  return (
    <div className="space-y-4">

      {/* MODAL CONFIRMACIÓN */}
      {confirmando && (() => {
        const p = partidos.find((x) => x.id === confirmando.id);
        return (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#1e293b] border border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5">
              <h3 className="text-white font-black uppercase tracking-widest text-center text-sm">¿Confirmar resultado?</h3>
              <div className="bg-[#0f172a] rounded-xl p-4 text-center space-y-2 border border-slate-700">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{p?.torneo?.nombre}</p>
                <p className="text-white font-bold text-sm">{p?.local?.nombre} <span className="text-slate-500">vs</span> {p?.visitante?.nombre}</p>
                <div className="flex items-center justify-center gap-4 pt-1">
                  <span className="text-5xl font-black text-white tabular-nums">{confirmando.l}</span>
                  <span className="text-slate-500 font-black text-3xl">-</span>
                  <span className="text-5xl font-black text-white tabular-nums">{confirmando.v}</span>
                </div>
                {confirmando.detalle && <p className="text-slate-400 text-xs font-mono">{confirmando.detalle}</p>}
              </div>
              <p className="text-amber-400 text-xs text-center font-bold">⚠ Este resultado actualizará la clasificación pública.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmando(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-all">Cancelar</button>
                <button onClick={guardarConfirmado} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-all">✅ Confirmar</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SIN PARTIDOS */}
      {partidos.length === 0 && (
        <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-sm">✅ No hay partidos pendientes</div>
      )}

      {/* LISTA PENDIENTES */}
      {partidos.map((p) => {
        const esPadel      = p.torneo?.deporte === 'padel';
        const estaGuardando = guardando === p.id;
        const estaEditando  = editando  === p.id;

        return (
          <div key={p.id} className="bg-[#0f172a] p-5 rounded-xl border border-slate-700 flex flex-col gap-4 shadow-lg">

            {/* Cabecera partido */}
            <div>
              <span className="bg-[#60A5FA] text-black text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest">{p.torneo?.nombre}</span>
              <div className="text-white font-bold mt-1.5 text-lg">
                {p?.local?.nombre || 'Esperando...'} <span className="text-slate-500 mx-1">vs</span> {p?.visitante?.nombre || 'Esperando...'}
              </div>
              {!estaEditando && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                    {p.fase} · {p.hora || '—'} · {p.ubicacion || '—'}
                  </span>
                  <button
                    onClick={() => iniciarEdicion(p)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#60A5FA] border border-slate-700 hover:border-[#60A5FA]/50 px-2 py-0.5 rounded transition-all"
                  >
                    ✏ Editar hora/pista
                  </button>
                </div>
              )}
            </div>

            {/* Editor hora/pista */}
            {estaEditando && (
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Editar horario y pista</p>
                <HoraUbicacionPicker
                  hora={editHora}
                  ubicacion={editUbicacion}
                  deporte={p.torneo?.deporte}
                  onHora={setEditHora}
                  onUbicacion={setEditUbicacion}
                />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setEditando(null)} className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                    <X size={13} /> Cancelar
                  </button>
                  <button onClick={() => guardarEdicion(p.id)} className="flex items-center gap-1.5 bg-[#60A5FA] hover:bg-blue-400 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                    <Check size={13} /> Guardar
                  </button>
                </div>
              </div>
            )}

            {/* Formulario resultado */}
            {p.local && p.visitante ? (
              <form
                className="flex flex-col gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700"
                onSubmit={(e) => {
                  e.preventDefault();
                  pedirConfirmacion(p.id, e.target.l.value, e.target.v.value, esPadel ? e.target.detalle?.value : null, esPadel);
                }}
              >
                <div className="flex items-end justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">{esPadel ? 'Sets Local' : 'Goles Local'}</span>
                    <input name="l" type="number" required min="0" max={esPadel ? 2 : 99} onChange={() => clearError(p.id)}
                      className="w-14 h-12 bg-black border border-slate-600 rounded-lg text-center text-white text-xl font-black focus:border-[#60A5FA] outline-none transition-colors" />
                    <span className="text-[9px] text-slate-500 font-bold mt-1 max-w-[80px] truncate text-center">{p.local.nombre}</span>
                  </div>
                  <span className="text-slate-500 font-black text-2xl pb-5">-</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">{esPadel ? 'Sets Visitante' : 'Goles Visitante'}</span>
                    <input name="v" type="number" required min="0" max={esPadel ? 2 : 99} onChange={() => clearError(p.id)}
                      className="w-14 h-12 bg-black border border-slate-600 rounded-lg text-center text-white text-xl font-black focus:border-[#60A5FA] outline-none transition-colors" />
                    <span className="text-[9px] text-slate-500 font-bold mt-1 max-w-[80px] truncate text-center">{p.visitante.nombre}</span>
                  </div>
                </div>

                {esPadel && (
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-center">Detalle de sets (para desempate)</label>
                    <input name="detalle" type="text" placeholder="Ej: 6-4, 4-6, 7-6" maxLength={30} onChange={() => clearError(p.id)}
                      className={`w-full bg-black border rounded-lg p-2.5 text-center text-sm text-white uppercase tracking-wider outline-none transition-colors ${errores[p.id] ? 'border-red-500' : 'border-slate-600 focus:border-amber-500'}`} />
                  </div>
                )}

                {errores[p.id] && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-red-400 text-[11px] font-bold leading-tight">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />{errores[p.id]}
                  </div>
                )}

                <button type="submit" disabled={estaGuardando}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2">
                  {estaGuardando ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</> : 'Guardar Partido'}
                </button>
              </form>
            ) : (
              <div className="text-xs font-bold text-amber-500 uppercase tracking-widest px-4 py-2 border border-amber-500/30 rounded-xl bg-amber-500/10 text-center">Faltan Clasificados</div>
            )}
          </div>
        );
      })}

      {/* CORREGIR FINALIZADOS */}
      <div className="mt-6 border border-slate-700/50 rounded-xl overflow-hidden">
        <button onClick={() => setVerFinalizados(!verFinalizados)}
          className="w-full flex items-center justify-between px-5 py-4 bg-slate-800/40 hover:bg-slate-800/70 transition-colors text-slate-400 hover:text-white">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><RotateCcw size={14} />Corregir resultado ya guardado</div>
          {verFinalizados ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {verFinalizados && (
          <div className="p-4 space-y-3 bg-[#0f172a]/60">
            <p className="text-amber-400 text-xs font-bold flex items-center gap-2"><AlertCircle size={13} />Los cambios actualizan la clasificación pública inmediatamente.</p>

            {cargandoFin && <p className="text-slate-500 text-xs animate-pulse font-bold uppercase tracking-widest">Cargando partidos finalizados...</p>}
            {!cargandoFin && finalizados.length === 0 && <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">No hay partidos finalizados en estos torneos.</p>}

            {!cargandoFin && finalizados.map((p) => {
              const esPadel = p.torneo?.deporte === 'padel';
              return (
                <div key={p.id} className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{p.torneo?.nombre} · {p.fase}</span>
                    <p className="text-white font-bold text-sm mt-0.5 truncate">{p.local?.nombre} <span className="text-slate-500">vs</span> {p.visitante?.nombre}</p>
                    <p className="text-slate-400 text-xs font-mono mt-1">
                      Guardado: <span className="text-white font-black">{p.puntuacion_local} - {p.puntuacion_visitante}</span>
                      {p.detalle_resultado && <span className="text-slate-500 ml-2">({p.detalle_resultado})</span>}
                    </p>
                  </div>
                  <form
                    className="flex flex-col gap-2 w-full md:w-auto bg-slate-900/60 p-3 rounded-xl border border-slate-700/50"
                    onSubmit={(e) => { e.preventDefault(); corregirResultado(p.id, e.target.lc.value, e.target.vc.value, esPadel ? e.target.detallec?.value : undefined, esPadel); }}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <input name="lc" type="number" defaultValue={p.puntuacion_local} min="0" max={esPadel ? 2 : 99} onChange={() => clearError(p.id)} className="w-10 h-9 bg-black border border-slate-600 rounded-lg text-center text-white font-black text-sm focus:border-amber-500 outline-none" />
                      <span className="text-slate-500 font-black">-</span>
                      <input name="vc" type="number" defaultValue={p.puntuacion_visitante} min="0" max={esPadel ? 2 : 99} onChange={() => clearError(p.id)} className="w-10 h-9 bg-black border border-slate-600 rounded-lg text-center text-white font-black text-sm focus:border-amber-500 outline-none" />
                    </div>
                    {esPadel && <input name="detallec" type="text" defaultValue={p.detalle_resultado || ''} placeholder="Ej: 6-4, 4-6, 7-6" onChange={() => clearError(p.id)} className="w-full bg-black border border-slate-600 rounded-lg p-1.5 text-center text-xs text-white outline-none focus:border-amber-500" />}
                    {errores[p.id] && <p className="text-red-400 text-[10px] font-bold text-center">{errores[p.id]}</p>}
                    <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-1.5 rounded-lg text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5">
                      <RotateCcw size={11} /> Corregir
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
