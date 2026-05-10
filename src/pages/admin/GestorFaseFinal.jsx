import { useState, useEffect } from 'react';
import { Trophy, Plus, CheckCircle2, AlertCircle, ChevronDown, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { HoraUbicacionPicker } from '../../components/ui/HoraUbicacionPicker';
import { calcularFaseAuto, confirmarFaseAuto } from '../../lib/generarFaseAuto';

const FASES = ['cuartos', 'semis', 'final', 'playoffs'];

const FASE_LABEL = {
  cuartos:  'Cuartos de Final',
  semis:    'Semifinales',
  final:    'Gran Final',
  playoffs: 'Ronda Previa',
};

export default function GestorFaseFinal({ onPartidoCreado }) {
  const [torneos,       setTorneos]       = useState([]);
  const [torneoId,      setTorneoId]      = useState('');
  const [torneoDeporte, setTorneoDeporte] = useState('futsal');
  const [participantes, setParticipantes] = useState([]);
  const [fase,          setFase]          = useState('semis');
  const [localId,       setLocalId]       = useState('');
  const [visitanteId,   setVisitanteId]   = useState('');
  const [hora,          setHora]          = useState('');
  const [ubicacion,     setUbicacion]     = useState('');
  const [estado,        setEstado]        = useState('idle');
  const [errorMsg,      setErrorMsg]      = useState('');
  const [creados,       setCreados]       = useState([]);

  // ── Estado generador automático ───────────────────────────────────────────
  const [autoFase,    setAutoFase]    = useState('idle'); // idle | loading | preview | confirmando | ok | error
  const [autoPreview, setAutoPreview] = useState(null);  // { fase, preview, insertar }
  const [autoError,   setAutoError]   = useState('');

  useEffect(() => {
    supabase.from('torneos').select('id, nombre, deporte').order('nombre').then(({ data }) => {
      if (data) setTorneos(data);
    });
  }, []);

  useEffect(() => {
    if (!torneoId) { setParticipantes([]); return; }

    const torneo = torneos.find((t) => t.id === torneoId);
    setTorneoDeporte(torneo?.deporte || 'futsal');
    setHora(''); setUbicacion('');
    setAutoFase('idle'); setAutoPreview(null); setAutoError('');

    async function cargarParticipantes() {
      const { data: grupos, error: e1 } = await supabase
        .from('grupos').select('id').eq('torneo_id', torneoId);
      if (e1 || !grupos?.length) { setParticipantes([]); return; }

      const { data, error: e2 } = await supabase
        .from('grupo_participantes')
        .select('participantes(id, nombre)')
        .in('grupo_id', grupos.map((g) => g.id));
      if (e2 || !data) { setParticipantes([]); return; }

      const vistos = new Set();
      const unicos = data
        .map((r) => r.participantes)
        .filter((p) => { if (!p || vistos.has(p.id)) return false; vistos.add(p.id); return true; })
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      setParticipantes(unicos);
      setLocalId(''); setVisitanteId('');
    }
    cargarParticipantes();
  }, [torneoId, torneos]);

  // ── Generador automático ──────────────────────────────────────────────────
  const handleAutoCalcular = async () => {
    if (!torneoId) { setAutoError('Selecciona un torneo primero.'); return; }
    setAutoFase('loading');
    setAutoError('');
    setAutoPreview(null);
    try {
      const resultado = await calcularFaseAuto(torneoId, torneoDeporte);
      setAutoPreview(resultado);
      setAutoFase('preview');
    } catch (err) {
      setAutoError(err.message);
      setAutoFase('error');
    }
  };

  const handleAutoConfirmar = async () => {
    if (!autoPreview) return;
    setAutoFase('confirmando');
    try {
      await confirmarFaseAuto(autoPreview.insertar);
      setAutoFase('ok');
      onPartidoCreado?.();
      setCreados((prev) => [...autoPreview.preview.map((p, i) => ({
        id:       `auto-${Date.now()}-${i}`,
        fase:     autoPreview.fase,
        hora:     null,
        ubicacion:null,
        torneo:   { nombre: torneos.find(t => t.id === torneoId)?.nombre },
        local:    { nombre: p.local.nombre },
        visitante:{ nombre: p.visitante.nombre },
      })), ...prev]);
      setTimeout(() => setAutoFase('idle'), 3000);
    } catch (err) {
      setAutoError(err.message);
      setAutoFase('error');
    }
  };

  // ── Formulario manual ─────────────────────────────────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!torneoId)                { setErrorMsg('Selecciona un torneo.');                     return; }
    if (!localId || !visitanteId) { setErrorMsg('Selecciona los dos equipos.');               return; }
    if (localId === visitanteId)  { setErrorMsg('Local y visitante no pueden ser el mismo.'); return; }

    setEstado('loading');

    const { data: existentes } = await supabase
      .from('partidos').select('jornada').eq('torneo_id', torneoId).eq('fase', fase)
      .order('jornada', { ascending: false }).limit(1);

    const jornada = existentes?.length > 0 ? existentes[0].jornada + 1 : 1;

    const { data, error } = await supabase
      .from('partidos')
      .insert([{ torneo_id: torneoId, fase, jornada, hora: hora || null, ubicacion: ubicacion || null, estado: 'pendiente', local_id: localId, visitante_id: visitanteId }])
      .select('id, fase, hora, ubicacion, local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre), torneo:torneos(nombre)')
      .single();

    if (error) { setErrorMsg('Error al crear el partido: ' + error.message); setEstado('error'); return; }

    setCreados((prev) => [data, ...prev]);
    setEstado('ok');
    setLocalId(''); setVisitanteId(''); setHora(''); setUbicacion('');
    onPartidoCreado?.();
    setTimeout(() => setEstado('idle'), 2000);
  };

  return (
    <div className="space-y-8">

      {/* ── GENERADOR AUTOMÁTICO ─────────────────────────────────────────── */}
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60">
          <Zap size={18} className="text-amber-400" />
          <div>
            <p className="text-white font-black text-sm uppercase tracking-widest">Generador automático</p>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Calcula los clasificados según la fase de grupos y crea los enfrentamientos automáticamente.
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Selector de torneo (compartido con el form manual) */}
          {!torneoId && (
            <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">
              Selecciona un torneo en el formulario de abajo para activar el generador.
            </p>
          )}

          {torneoId && autoFase === 'idle' && (
            <button
              onClick={handleAutoCalcular}
              className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 hover:text-amber-300 font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-all"
            >
              <Zap size={14} /> Calcular clasificados y previsualizar
            </button>
          )}

          {autoFase === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-4 text-amber-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-xs font-black uppercase tracking-widest">Calculando clasificaciones...</span>
            </div>
          )}

          {(autoFase === 'preview' || autoFase === 'confirmando') && autoPreview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full">
                  {FASE_LABEL[autoPreview.fase] ?? autoPreview.fase}
                </span>
                <span className="text-slate-500 text-xs">— {autoPreview.preview.length} partidos a crear</span>
              </div>

              <div className="space-y-2">
                {autoPreview.preview.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                    <span className="text-slate-600 text-xs font-black w-4">{i + 1}</span>
                    <span className="text-white font-bold text-sm flex-1 truncate">{p.local.nombre}</span>
                    <ArrowRight size={14} className="text-amber-500 flex-shrink-0" />
                    <span className="text-white font-bold text-sm flex-1 truncate text-right">{p.visitante.nombre}</span>
                  </div>
                ))}
              </div>

              <p className="text-slate-500 text-xs">
                Las horas y pistas quedarán vacías — edítalas después desde "Resultados Pendientes".
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => { setAutoFase('idle'); setAutoPreview(null); }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAutoConfirmar}
                  disabled={autoFase === 'confirmando'}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-all"
                >
                  {autoFase === 'confirmando'
                    ? <><Loader2 size={13} className="animate-spin" /> Creando...</>
                    : <><CheckCircle2 size={13} /> Confirmar y crear</>}
                </button>
              </div>
            </div>
          )}

          {autoFase === 'ok' && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 text-sm font-bold">
              <CheckCircle2 size={18} /> ¡Partidos creados correctamente!
            </div>
          )}

          {autoFase === 'error' && autoError && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm font-bold">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" /> {autoError}
              </div>
              <button
                onClick={() => { setAutoFase('idle'); setAutoError(''); }}
                className="text-xs text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors"
              >
                ← Volver a intentarlo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── DIVISOR ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-700/60" />
        <span className="text-slate-600 text-xs font-black uppercase tracking-widest">o añadir partido manual</span>
        <div className="flex-1 h-px bg-slate-700/60" />
      </div>

      {/* ── FORMULARIO MANUAL ────────────────────────────────────────────── */}
      <form onSubmit={handleCrear} className="space-y-6">

        {/* Torneo */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Torneo</label>
          <SelectField
            value={torneoId}
            onChange={(v) => setTorneoId(v)}
            placeholder="— Selecciona un torneo —"
            options={torneos.map((t) => ({ value: t.id, label: t.nombre }))}
          />
        </div>

        {/* Fase */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Fase</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FASES.map((f) => (
              <button
                key={f} type="button" onClick={() => setFase(f)}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                  fase === f
                    ? 'bg-[#60A5FA] text-black border-[#60A5FA] shadow-lg'
                    : 'bg-[#0f172a] text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
              >
                {FASE_LABEL[f] ?? f}
              </button>
            ))}
          </div>
        </div>

        {/* Equipos */}
        {participantes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">🏠 Local</label>
              <SelectField value={localId} onChange={setLocalId} placeholder="— Local —"
                options={participantes.filter((p) => p.id !== visitanteId).map((p) => ({ value: p.id, label: p.nombre }))} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">✈️ Visitante</label>
              <SelectField value={visitanteId} onChange={setVisitanteId} placeholder="— Visitante —"
                options={participantes.filter((p) => p.id !== localId).map((p) => ({ value: p.id, label: p.nombre }))} />
            </div>
          </div>
        ) : torneoId ? (
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest animate-pulse">Cargando participantes...</p>
        ) : (
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Selecciona un torneo para ver los equipos.</p>
        )}

        <HoraUbicacionPicker
          hora={hora}
          ubicacion={ubicacion}
          deporte={torneoDeporte}
          onHora={setHora}
          onUbicacion={setUbicacion}
        />

        {errorMsg && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm font-bold">
            <AlertCircle size={18} className="flex-shrink-0" /> {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={estado === 'loading' || estado === 'ok'}
          className={`w-full font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-60 ${
            estado === 'ok'
              ? 'bg-emerald-600 text-white'
              : 'bg-[#60A5FA] hover:bg-blue-400 text-black shadow-[0_0_20px_rgba(96,165,250,0.2)]'
          }`}
        >
          {estado === 'loading'
            ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creando...</>
            : estado === 'ok'
            ? <><CheckCircle2 size={18} /> ¡Partido creado!</>
            : <><Plus size={18} /> Crear partido de {FASE_LABEL[fase] ?? fase}</>}
        </button>
      </form>

      {/* ── Creados en esta sesión ──────────────────────────────────────────── */}
      {creados.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <Trophy size={14} /> Creados en esta sesión
          </h3>
          <div className="space-y-2">
            {creados.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#60A5FA] mr-2">{p.torneo?.nombre}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{p.fase}</span>
                  <p className="text-white font-bold mt-0.5">{p.local?.nombre} <span className="text-slate-500">vs</span> {p.visitante?.nombre}</p>
                </div>
                <div className="text-right text-xs text-slate-500 font-medium">
                  <p>{p.hora || '—'}</p>
                  <p>{p.ubicacion || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SelectField({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold appearance-none focus:border-[#60A5FA] outline-none transition-colors [&>option]:bg-[#0f172a]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}
