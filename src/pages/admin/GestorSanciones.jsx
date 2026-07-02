import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Plus, Trash2, AlertCircle, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { sanitizarEquipo } from '../../lib/sanitize';

/**
 * Registro de sanciones (tarjetas / expulsiones) por torneo.
 * Permite añadir: jugador + equipo + tipo de tarjeta + partidos de sanción,
 * listarlas y eliminarlas. Lectura pública desde las vistas de torneo.
 */
export default function GestorSanciones() {
  const [torneos,       setTorneos]       = useState([]);
  const [torneoId,      setTorneoId]      = useState('');
  const [participantes, setParticipantes] = useState([]);
  const [sanciones,     setSanciones]     = useState([]);
  const [cargando,      setCargando]      = useState(false);

  // Formulario
  const [jugador,   setJugador]   = useState('');
  const [equipoId,  setEquipoId]  = useState('');
  const [tipo,      setTipo]      = useState('roja');
  const [partidos,  setPartidos]  = useState(0);
  const [motivo,    setMotivo]    = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState('');
  const [okMsg,     setOkMsg]     = useState(false);

  useEffect(() => {
    supabase.from('torneos').select('id, nombre').order('nombre').then(({ data }) => {
      if (data) setTorneos(data);
    });
  }, []);

  const cargarSanciones = useCallback(async (tId) => {
    if (!tId) { setSanciones([]); return; }
    setCargando(true);
    const { data } = await supabase
      .from('sanciones')
      .select('id, jugador, tipo, partidos_sancion, motivo, participante_id, participantes(nombre)')
      .eq('torneo_id', tId)
      .order('created_at', { ascending: false });
    setSanciones(data || []);
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(''); setOkMsg(false); setJugador(''); setEquipoId(''); setTipo('roja'); setPartidos(0); setMotivo('');
    if (!torneoId) { setParticipantes([]); setSanciones([]); return; }

    async function cargar() {
      const { data: grupos } = await supabase.from('grupos').select('id').eq('torneo_id', torneoId);
      if (grupos?.length) {
        const { data } = await supabase
          .from('grupo_participantes')
          .select('participantes(id, nombre)')
          .in('grupo_id', grupos.map((g) => g.id));
        const vistos = new Set();
        const unicos = (data || [])
          .map((r) => r.participantes)
          .filter((p) => p && !vistos.has(p.id) && vistos.add(p.id))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        setParticipantes(unicos);
      } else {
        setParticipantes([]);
      }
      cargarSanciones(torneoId);
    }
    cargar();
  }, [torneoId, cargarSanciones]);

  const añadir = async (e) => {
    e.preventDefault();
    setError('');
    const nombreJugador = sanitizarEquipo(jugador);
    if (!torneoId)       { setError('Selecciona un torneo.');        return; }
    if (!nombreJugador)  { setError('Escribe el nombre del jugador.'); return; }
    if (!equipoId)       { setError('Selecciona el equipo.');        return; }

    setGuardando(true);
    const { error: e1 } = await supabase.from('sanciones').insert([{
      torneo_id:        torneoId,
      participante_id:  equipoId,
      jugador:          nombreJugador,
      tipo,
      partidos_sancion: Number(partidos) || 0,
      motivo:           motivo.trim() ? sanitizarEquipo(motivo) : null,
    }]);
    setGuardando(false);

    if (e1) { setError('Error al guardar: ' + e1.message); return; }
    setJugador(''); setEquipoId(''); setTipo('roja'); setPartidos(0); setMotivo('');
    setOkMsg(true);
    setTimeout(() => setOkMsg(false), 2500);
    cargarSanciones(torneoId);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta sanción?')) return;
    const { error: e1 } = await supabase.from('sanciones').delete().eq('id', id);
    if (!e1) cargarSanciones(torneoId);
  };

  return (
    <div className="space-y-6">
      {/* Selector de torneo */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Torneo</label>
        <div className="relative">
          <select
            value={torneoId}
            onChange={(e) => setTorneoId(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold appearance-none focus:border-[#60A5FA] outline-none transition-colors [&>option]:bg-[#0f172a]"
          >
            <option value="">— Selecciona un torneo —</option>
            {torneos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {torneoId && (
        <>
          {/* Formulario */}
          <form onSubmit={añadir} className="bg-[#0f172a] border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Jugador</label>
                <input
                  value={jugador}
                  onChange={(e) => setJugador(e.target.value)}
                  maxLength={40}
                  placeholder="Nombre del jugador"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:border-[#60A5FA] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Equipo</label>
                <div className="relative">
                  <select
                    value={equipoId}
                    onChange={(e) => setEquipoId(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm appearance-none focus:border-[#60A5FA] outline-none transition-colors [&>option]:bg-[#0f172a]"
                  >
                    <option value="">— Equipo —</option>
                    {participantes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Tarjeta</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'amarilla', l: '🟨 Amarilla' },
                    { v: 'roja',     l: '🟥 Roja'     },
                  ].map(({ v, l }) => (
                    <button
                      key={v} type="button" onClick={() => setTipo(v)}
                      className={`py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                        tipo === v ? 'bg-[#60A5FA] text-black border-[#60A5FA]' : 'bg-[#1e293b] text-slate-400 border-slate-700 hover:border-slate-500'
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Partidos de sanción</label>
                <input
                  type="number" min="0" max="99" value={partidos}
                  onChange={(e) => setPartidos(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:border-[#60A5FA] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Motivo (opcional)</label>
                <input
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  maxLength={40}
                  placeholder="Ej: roja directa"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:border-[#60A5FA] outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-xs font-bold">
                <AlertCircle size={13} className="flex-shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit" disabled={guardando}
              className={`w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-all disabled:opacity-50 ${
                okMsg ? 'bg-emerald-600 text-white' : 'bg-[#60A5FA] hover:bg-blue-400 text-black'
              }`}
            >
              {guardando ? <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                : okMsg   ? <><CheckCircle2 size={14} /> ¡Sanción registrada!</>
                :           <><Plus size={14} /> Registrar sanción</>}
            </button>
          </form>

          {/* Listado */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <ShieldAlert size={14} /> Sanciones registradas ({sanciones.length})
            </h3>
            {cargando && <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Cargando...</p>}
            {!cargando && sanciones.length === 0 && (
              <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">No hay sanciones en este torneo.</p>
            )}
            <div className="space-y-2">
              {sanciones.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 bg-[#0f172a] border border-slate-700/60 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">
                      <span className="mr-1">{s.tipo === 'roja' ? '🟥' : '🟨'}</span>
                      {s.jugador}
                      <span className="text-slate-500 font-medium"> · {s.participantes?.nombre ?? 'Equipo'}</span>
                    </p>
                    <p className="text-slate-500 text-[11px] font-bold mt-0.5">
                      {s.partidos_sancion > 0 ? `${s.partidos_sancion} partido(s) de sanción` : 'Sin partidos de sanción'}
                      {s.motivo ? ` · ${s.motivo}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => eliminar(s.id)}
                    className="flex-shrink-0 flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Trash2 size={12} /> Borrar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
