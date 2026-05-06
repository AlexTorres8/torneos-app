import { useState } from 'react';
import { Pencil, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase';
import { validarResultadoPadel } from '../../lib/validarPadel';

export default function ResultadosPendientes({ partidos, onActualizar }) {
  const [editando,      setEditando]      = useState(null);
  const [editHora,      setEditHora]      = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');
  // errores de validación por id de partido
  const [errores,       setErrores]       = useState({});

  const setError   = (id, msg) => setErrores((prev) => ({ ...prev, [id]: msg }));
  const clearError = (id)      => setErrores((prev) => { const n = { ...prev }; delete n[id]; return n; });

  const guardarResultado = async (id, l, v, detalle, esPadel) => {
    clearError(id);

    // ── Validación específica de pádel ───────────────────────────────────
    if (esPadel) {
      const { ok, error } = validarResultadoPadel(l, v, detalle);
      if (!ok) { setError(id, error); return; }
    }

    const payload = {
      puntuacion_local:     parseInt(l),
      puntuacion_visitante: parseInt(v),
      estado:               'finalizado',
    };
    if (detalle) payload.detalle_resultado = detalle;

    const { error: dbError } = await supabase.from('partidos').update(payload).eq('id', id);
    if (dbError) { setError(id, 'Error al guardar: ' + dbError.message); return; }
    onActualizar();
  };

  const iniciarEdicion = (p) => {
    setEditando(p.id);
    setEditHora(p.hora || '');
    setEditUbicacion(p.ubicacion || '');
  };

  const guardarEdicion = async (id) => {
    const { error } = await supabase
      .from('partidos')
      .update({ hora: editHora, ubicacion: editUbicacion })
      .eq('id', id);
    if (!error) { setEditando(null); onActualizar(); }
  };

  if (partidos.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-sm">
        ✅ No hay partidos pendientes
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {partidos.map((p) => {
        const esPadel = p.torneo?.deporte === 'padel';

        return (
          <div
            key={p.id}
            className="bg-[#0f172a] p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between shadow-lg"
          >
            {/* ── INFO ── */}
            <div className="flex-1 w-full text-center md:text-left">
              <span className="bg-[#60A5FA] text-black text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
                {p.torneo?.nombre}
              </span>
              <div className="text-white font-bold mt-1.5 text-lg">
                {p?.local?.nombre || 'Esperando...'}{' '}
                <span className="text-slate-500 mx-1">vs</span>{' '}
                {p?.visitante?.nombre || 'Esperando...'}
              </div>

              {/* Edición hora/pista */}
              {editando === p.id ? (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <input
                    value={editHora}
                    onChange={(e) => setEditHora(e.target.value)}
                    placeholder="Hora (ej: 20:00)"
                    className="bg-black border border-slate-600 rounded px-2 py-1 text-white text-xs w-28 focus:border-blue-400 outline-none"
                  />
                  <input
                    value={editUbicacion}
                    onChange={(e) => setEditUbicacion(e.target.value)}
                    placeholder="Pista/Ubicación"
                    className="bg-black border border-slate-600 rounded px-2 py-1 text-white text-xs w-40 focus:border-blue-400 outline-none"
                  />
                  <button onClick={() => guardarEdicion(p.id)} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditando(null)} className="text-red-500 hover:text-red-400 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                    {p.fase} · {p.hora || '—'} · {p.ubicacion || '—'}
                  </span>
                  <button
                    onClick={() => iniciarEdicion(p)}
                    className="text-slate-600 hover:text-slate-300 transition-colors"
                    title="Editar hora/pista"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* ── FORMULARIO RESULTADO ── */}
            {p.local && p.visitante ? (
              <form
                className="flex flex-col gap-3 w-full md:w-auto bg-slate-800/50 p-3 rounded-lg border border-slate-700"
                onSubmit={(e) => {
                  e.preventDefault();
                  guardarResultado(
                    p.id,
                    e.target.l.value,
                    e.target.v.value,
                    esPadel ? e.target.detalle?.value : null,
                    esPadel
                  );
                }}
              >
                <div className="flex justify-center md:justify-end items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                      {esPadel ? 'Sets L.' : 'Local'}
                    </span>
                    <input
                      name="l"
                      type="number"
                      required
                      min="0"
                      max={esPadel ? 2 : 99}
                      onChange={() => clearError(p.id)}
                      className="w-12 h-10 bg-black border border-slate-600 rounded text-center text-white font-black focus:border-[#60A5FA] outline-none"
                    />
                  </div>
                  <span className="text-slate-500 font-black mt-4">-</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                      {esPadel ? 'Sets V.' : 'Visitante'}
                    </span>
                    <input
                      name="v"
                      type="number"
                      required
                      min="0"
                      max={esPadel ? 2 : 99}
                      onChange={() => clearError(p.id)}
                      className="w-12 h-10 bg-black border border-slate-600 rounded text-center text-white font-black focus:border-[#60A5FA] outline-none"
                    />
                  </div>
                </div>

                {/* Detalle sets pádel */}
                {esPadel && (
                  <input
                    name="detalle"
                    type="text"
                    placeholder="Ej: 6-4, 4-6, 7-6"
                    onChange={() => clearError(p.id)}
                    className={`w-full bg-black border rounded p-2 text-center text-xs text-white uppercase tracking-wider outline-none transition-colors ${
                      errores[p.id]
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-slate-600 focus:border-amber-500'
                    }`}
                  />
                )}

                {/* Error de validación inline */}
                {errores[p.id] && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-red-400 text-[11px] font-bold leading-tight">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {errores[p.id]}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded text-xs transition-colors uppercase tracking-widest shadow-lg"
                >
                  Guardar Partido
                </button>
              </form>
            ) : (
              <div className="text-xs font-bold text-amber-500 uppercase tracking-widest px-4 py-2 border border-amber-500/30 rounded bg-amber-500/10 whitespace-nowrap">
                Faltan Clasificados
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
