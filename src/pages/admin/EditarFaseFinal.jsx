import { useState, useEffect } from 'react';
import { Pencil, X, Save, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabase';
import { HoraUbicacionPicker } from '../../components/ui/HoraUbicacionPicker';

const FASE_LABEL = {
  playoffs: 'Ronda Previa',
  cuartos:  'Cuartos de Final',
  semis:    'Semifinales',
  final:    'Gran Final',
};
const FASE_ORDER = ['playoffs', 'cuartos', 'semis', 'final'];

/**
 * Muestra todos los partidos de fase final de un torneo agrupados por fase
 * y permite editar inline: equipos local/visitante, hora y pista.
 *
 * Props:
 *   torneoId      {string}
 *   torneoDeporte {string}   'futsal' | 'padel'
 *   participantes {Array}    [{ id, nombre }] — todos los del torneo
 *   onActualizar  {fn}       callback tras guardar
 */
export default function EditarFaseFinal({ torneoId, torneoDeporte, participantes, onActualizar }) {
  const [partidos,    setPartidos]    = useState([]);
  const [cargando,    setCargando]    = useState(false);
  const [editando,    setEditando]    = useState(null);
  const [editLocal,   setEditLocal]   = useState('');
  const [editVisit,   setEditVisit]   = useState('');
  const [editHora,    setEditHora]    = useState('');
  const [editUbic,    setEditUbic]    = useState('');
  const [guardando,   setGuardando]   = useState(null);
  const [errores,     setErrores]     = useState({});

  const cargar = async () => {
    if (!torneoId) { setPartidos([]); return; }
    setCargando(true);
    let q = supabase
      .from('partidos')
      .select('id, fase, jornada, hora, ubicacion, estado, local_id, visitante_id, local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)')
      .eq('torneo_id', torneoId)
      .neq('fase', 'grupos')
      .order('jornada');
    const { data, error } = await q;
    if (!error && data) setPartidos(data);
    setCargando(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { cargar(); }, [torneoId]);

  const limpiarError = (id) => setErrores(p => { const n = { ...p }; delete n[id]; return n; });

  const abrirEdicion = (p) => {
    setEditando(p.id);
    setEditLocal(p.local_id   || '');
    setEditVisit(p.visitante_id || '');
    setEditHora(p.hora         || '');
    setEditUbic(p.ubicacion    || '');
    limpiarError(p.id);
  };

  const cancelar = () => setEditando(null);

  const guardar = async (p) => {
    if (!editLocal || !editVisit) {
      setErrores(e => ({ ...e, [p.id]: 'Selecciona los dos equipos.' })); return;
    }
    if (editLocal === editVisit) {
      setErrores(e => ({ ...e, [p.id]: 'Local y visitante no pueden ser el mismo.' })); return;
    }
    setGuardando(p.id);
    limpiarError(p.id);

    const { error } = await supabase
      .from('partidos')
      .update({
        local_id:     editLocal,
        visitante_id: editVisit,
        hora:         editHora || null,
        ubicacion:    editUbic || null,
      })
      .eq('id', p.id);

    setGuardando(null);
    if (error) {
      setErrores(e => ({ ...e, [p.id]: 'Error al guardar: ' + error.message }));
    } else {
      setEditando(null);
      cargar();
      onActualizar?.();
    }
  };

  // Agrupar por fase respetando el orden lógico
  const porFase = FASE_ORDER.reduce((acc, f) => {
    const ps = partidos.filter(p => p.fase === f);
    if (ps.length) acc[f] = ps;
    return acc;
  }, {});

  if (!torneoId) return (
    <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
      Selecciona un torneo arriba para ver y editar sus fases.
    </p>
  );

  if (cargando) return (
    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
      Cargando partidos...
    </p>
  );

  if (!Object.keys(porFase).length) return (
    <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
      No hay partidos de fase eliminatoria creados para este torneo.
    </p>
  );

  return (
    <div className="space-y-6">
      {Object.entries(porFase).map(([fase, matches]) => (
        <div key={fase}>
          <p className="text-xs font-black uppercase tracking-widest text-[#60A5FA] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
            {FASE_LABEL[fase] ?? fase}
            <span className="text-slate-600 font-bold">({matches.length})</span>
          </p>

          <div className="space-y-2">
            {matches.map((p) => {
              const enEdicion     = editando === p.id;
              const estaGuardando = guardando === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-[#0f172a] border rounded-xl transition-colors ${
                    enEdicion ? 'border-[#60A5FA]/40' : 'border-slate-700/50'
                  }`}
                >
                  {/* Cabecera */}
                  <div className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-sm truncate">
                        {p.local?.nombre ?? <span className="text-slate-600 italic">Sin asignar</span>}
                        {' '}<span className="text-slate-500">vs</span>{' '}
                        {p.visitante?.nombre ?? <span className="text-slate-600 italic">Sin asignar</span>}
                      </p>
                      <p className="text-slate-600 text-[10px] font-bold mt-0.5 flex items-center gap-1.5">
                        <span>{p.hora || '—'}</span>
                        <span>·</span>
                        <span>{p.ubicacion || '—'}</span>
                        <span>·</span>
                        <span className={p.estado === 'finalizado' ? 'text-emerald-500' : 'text-slate-500'}>
                          {p.estado === 'finalizado' ? 'Finalizado' : 'Pendiente'}
                        </span>
                      </p>
                    </div>

                    {!enEdicion ? (
                      <button
                        onClick={() => abrirEdicion(p)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex-shrink-0"
                      >
                        <Pencil size={11} /> Editar
                      </button>
                    ) : (
                      <button
                        onClick={cancelar}
                        className="text-slate-500 hover:text-white p-1 transition-colors flex-shrink-0"
                        aria-label="Cancelar"
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>

                  {/* Panel de edición */}
                  {enEdicion && (
                    <div className="border-t border-slate-700/50 p-4 space-y-4">

                      {/* Equipos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                            🏠 Local
                          </label>
                          <SelectEquipo
                            value={editLocal}
                            onChange={(v) => { setEditLocal(v); limpiarError(p.id); }}
                            placeholder="— Local —"
                            options={participantes.filter(x => x.id !== editVisit)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                            ✈️ Visitante
                          </label>
                          <SelectEquipo
                            value={editVisit}
                            onChange={(v) => { setEditVisit(v); limpiarError(p.id); }}
                            placeholder="— Visitante —"
                            options={participantes.filter(x => x.id !== editLocal)}
                          />
                        </div>
                      </div>

                      {/* Hora + Pista */}
                      <HoraUbicacionPicker
                        hora={editHora}
                        ubicacion={editUbic}
                        deporte={torneoDeporte}
                        onHora={setEditHora}
                        onUbicacion={setEditUbic}
                      />

                      {/* Error */}
                      {errores[p.id] && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-xs font-bold">
                          <AlertCircle size={13} className="flex-shrink-0" />
                          {errores[p.id]}
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
                          onClick={() => guardar(p)}
                          disabled={estaGuardando}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#60A5FA] hover:bg-blue-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-2.5 rounded-xl text-xs transition-all"
                        >
                          {estaGuardando
                            ? <><Loader2 size={12} className="animate-spin" /> Guardando...</>
                            : <><Save size={12} /> Guardar cambios</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectEquipo({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm appearance-none focus:border-[#60A5FA] outline-none transition-colors [&>option]:bg-[#0f172a]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.nombre}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}
