import { useState, useEffect } from 'react';
import { Pencil, X, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase';

const ESTADOS_COMUNES = [
  'Inscripciones abiertas',
  'Inscripciones cerradas',
  'Fase de grupos',
  'Fase final',
  'Finalizado',
];

export default function EditarEstadoTorneo() {
  const [torneos,   setTorneos]   = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [editando,  setEditando]  = useState(null);
  const [editValor, setEditValor] = useState('');
  const [guardando, setGuardando] = useState(null);
  const [errores,   setErrores]   = useState({});
  const [okIds,     setOkIds]     = useState([]);

  const cargar = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('torneos')
      .select('id, nombre, deporte, estado')
      .order('nombre');
    setTorneos(data || []);
    setCargando(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, []);

  const abrirEdicion = (t) => {
    setEditando(t.id);
    setEditValor(t.estado || '');
    setErrores(e => { const n = { ...e }; delete n[t.id]; return n; });
    setOkIds(ids => ids.filter(x => x !== t.id));
  };

  const cancelar = () => setEditando(null);

  const guardar = async (t) => {
    const val = editValor.trim();
    if (!val) {
      setErrores(e => ({ ...e, [t.id]: 'El estado no puede estar vacío.' }));
      return;
    }
    setGuardando(t.id);
    const { error } = await supabase
      .from('torneos')
      .update({ estado: val })
      .eq('id', t.id);
    setGuardando(null);
    if (error) {
      setErrores(e => ({ ...e, [t.id]: 'Error al guardar: ' + error.message }));
    } else {
      setTorneos(prev => prev.map(x => x.id === t.id ? { ...x, estado: val } : x));
      setEditando(null);
      setOkIds(ids => [...ids, t.id]);
      setTimeout(() => setOkIds(ids => ids.filter(x => x !== t.id)), 2500);
    }
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

  return (
    <div className="space-y-3">
      {torneos.map((t) => {
        const enEdicion     = editando === t.id;
        const estaGuardando = guardando === t.id;
        const guardadoOk    = okIds.includes(t.id);
        const esFS          = t.deporte === 'futsal';

        return (
          <div
            key={t.id}
            className={`bg-[#0f172a] border rounded-xl transition-colors ${
              enEdicion ? 'border-[#60A5FA]/40' : 'border-slate-700/50'
            }`}
          >
            {/* Fila principal */}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-sm truncate">{t.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    esFS ? 'text-[#60A5FA]' : 'text-emerald-400'
                  }`}>
                    {t.deporte === 'futsal' ? 'Futsal' : 'Pádel'}
                  </span>
                  <span className="text-slate-700">·</span>
                  {guardadoOk ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={10} /> Guardado
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-bold italic">{t.estado || '—'}</span>
                  )}
                </div>
              </div>

              {!enEdicion ? (
                <button
                  onClick={() => abrirEdicion(t)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex-shrink-0"
                >
                  <Pencil size={11} /> Editar
                </button>
              ) : (
                <button
                  onClick={cancelar}
                  className="text-slate-500 hover:text-white p-1 transition-colors flex-shrink-0"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* Panel edición */}
            {enEdicion && (
              <div className="border-t border-slate-700/50 p-4 space-y-3">

                {/* Opciones rápidas */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    Opciones rápidas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ESTADOS_COMUNES.map((op) => (
                      <button
                        key={op}
                        onClick={() => setEditValor(op)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-all ${
                          editValor === op
                            ? 'bg-[#60A5FA]/20 border-[#60A5FA]/60 text-[#60A5FA]'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input texto libre */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Texto personalizado
                  </p>
                  <input
                    value={editValor}
                    onChange={(e) => setEditValor(e.target.value)}
                    maxLength={80}
                    placeholder="Ej: Fase de grupos · Jornada 3"
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:border-[#60A5FA] outline-none transition-colors"
                  />
                </div>

                {/* Error */}
                {errores[t.id] && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-xs font-bold">
                    <AlertCircle size={13} className="flex-shrink-0" />
                    {errores[t.id]}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={cancelar}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white font-black uppercase tracking-widest py-2.5 rounded-xl text-xs transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => guardar(t)}
                    disabled={estaGuardando}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#60A5FA] hover:bg-blue-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-2.5 rounded-xl text-xs transition-all"
                  >
                    {estaGuardando
                      ? <><Loader2 size={12} className="animate-spin" /> Guardando...</>
                      : <><Save size={12} /> Guardar</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
