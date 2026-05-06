import { useState } from 'react';
import { Wand2, Users, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase';

// ─── Utilidades ────────────────────────────────────────────────────────────────

/** Mezcla un array de forma aleatoria (Fisher-Yates) */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Reparte un array en N grupos lo más equilibrados posible */
function repartirEnGrupos(items, tamGrupo) {
  const total   = items.length;
  const nGrupos = Math.ceil(total / tamGrupo);
  const grupos  = Array.from({ length: nGrupos }, () => []);
  items.forEach((item, i) => grupos[i % nGrupos].push(item));
  return grupos;
}

/** Genera los enfrentamientos todos-contra-todos dentro de un grupo (round-robin) */
function generarLiguilla(equipos) {
  const partidos = [];
  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      partidos.push({ local: equipos[i], visitante: equipos[j] });
    }
  }
  return partidos;
}

/** Nombre de grupo por índice: A, B, C … */
const letraGrupo = (i) => String.fromCharCode(65 + i);

// ─── Componente ────────────────────────────────────────────────────────────────

export default function CreadorTorneo({ onTorneoCreado }) {
  const [nombre,      setNombre]      = useState('');
  const [deporte,     setDeporte]     = useState('futsal');
  const [textoEquipos,setTextoEquipos]= useState('');
  const [tamGrupo,    setTamGrupo]    = useState(4);
  const [estado,      setEstado]      = useState('Inscripciones abiertas');
  const [fase,        setFase]        = useState('idle'); // idle | preview | loading | done | error
  const [preview,     setPreview]     = useState(null);   // { grupos: [[nombres]] }
  const [error,       setError]       = useState('');

  // ── Parsear equipos del textarea ──────────────────────────────────────────
  const parsearEquipos = () => {
    return textoEquipos
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);
  };

  // ── Generar preview (sin tocar la BD) ─────────────────────────────────────
  const generarPreview = () => {
    setError('');
    const equipos = parsearEquipos();

    if (!nombre.trim()) { setError('Escribe un nombre para el torneo.'); return; }
    if (equipos.length < 4) { setError('Necesitas al menos 4 equipos/parejas.'); return; }

    const mezclados = shuffle(equipos);
    const grupos    = repartirEnGrupos(mezclados, tamGrupo);
    setPreview({ grupos });
    setFase('preview');
  };

  // ── Crear en Supabase ──────────────────────────────────────────────────────
  const crearTorneo = async () => {
    if (!preview) return;
    setFase('loading');
    setError('');

    try {
      // 1. Torneo
      const { data: torneo, error: e1 } = await supabase
        .from('torneos')
        .insert([{ nombre: nombre.trim(), deporte, estado }])
        .select()
        .single();
      if (e1) throw new Error('Error creando torneo: ' + e1.message);
      const tId = torneo.id;

      // 2. Grupos
      const insGrupos = preview.grupos.map((_, i) => ({
        torneo_id: tId,
        nombre: `GRUPO ${letraGrupo(i)}`,
      }));
      const { data: gruposDB, error: e2 } = await supabase
        .from('grupos')
        .insert(insGrupos)
        .select();
      if (e2) throw new Error('Error creando grupos: ' + e2.message);

      // 3. Participantes (upsert por nombre único)
      const todosNombres = preview.grupos.flat();
      const { data: participantesDB, error: e3 } = await supabase
        .from('participantes')
        .upsert(todosNombres.map((n) => ({ nombre: n })), { onConflict: 'nombre' })
        .select();
      if (e3) throw new Error('Error creando participantes: ' + e3.message);

      const idPor = (nombre) => participantesDB.find((p) => p.nombre === nombre)?.id;

      // 4. Asignar participantes a grupos
      const asignaciones = preview.grupos.flatMap((equipos, gi) =>
        equipos.map((eq) => ({
          grupo_id:        gruposDB[gi].id,
          participante_id: idPor(eq),
        }))
      );
      const { error: e4 } = await supabase.from('grupo_participantes').insert(asignaciones);
      if (e4) throw new Error('Error asignando participantes: ' + e4.message);

      // 5. Generar partidos de liguilla (sin hora/pista, el admin las edita después)
      const partidos = preview.grupos.flatMap((equipos, gi) => {
        const cruces  = generarLiguilla(equipos);
        return cruces.map((cruce, ci) => ({
          torneo_id:   tId,
          fase:        'grupos',
          jornada:     ci + 1,
          hora:        null,
          ubicacion:   null,
          estado:      'pendiente',
          local_id:    idPor(cruce.local),
          visitante_id:idPor(cruce.visitante),
        }));
      });

      const { error: e5 } = await supabase.from('partidos').insert(partidos);
      if (e5) throw new Error('Error creando partidos: ' + e5.message);

      setFase('done');
      onTorneoCreado?.();
    } catch (err) {
      console.error('[CreadorTorneo]', err);
      setError(err.message);
      setFase('error');
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setNombre(''); setDeporte('futsal'); setTextoEquipos('');
    setTamGrupo(4); setEstado('Inscripciones abiertas');
    setFase('idle'); setPreview(null); setError('');
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (fase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
        <CheckCircle2 size={64} className="text-emerald-500" />
        <h3 className="text-2xl font-black text-white uppercase tracking-widest">¡Torneo creado!</h3>
        <p className="text-slate-400 text-sm max-w-sm">
          La estructura de grupos y partidos está lista en la base de datos.
          Ahora puedes editar la hora y pista de cada partido desde la sección de Resultados Pendientes.
        </p>
        <button onClick={reset} className="bg-[#60A5FA] text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-blue-400 transition-all">
          Crear otro torneo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── FORMULARIO ── */}
      {(fase === 'idle' || fase === 'error') && (
        <div className="space-y-5">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Nombre del Torneo
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Liga Futsal Verano 2026"
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-[#60A5FA] outline-none transition-colors"
            />
          </div>

          {/* Deporte + Estado (fila) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Deporte
              </label>
              <div className="relative">
                <select
                  value={deporte}
                  onChange={(e) => setDeporte(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold appearance-none focus:border-[#60A5FA] outline-none transition-colors"
                >
                  <option value="futsal">⚽ Futsal</option>
                  <option value="padel">🎾 Pádel</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Estado inicial
              </label>
              <div className="relative">
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold appearance-none focus:border-[#60A5FA] outline-none transition-colors"
                >
                  <option>Inscripciones abiertas</option>
                  <option>Inscripciones cerradas</option>
                  <option>En curso</option>
                  <option>Finalizado</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tamaño de grupo */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Equipos por grupo: <span className="text-[#60A5FA]">{tamGrupo}</span>
            </label>
            <input
              type="range" min={3} max={6} value={tamGrupo}
              onChange={(e) => setTamGrupo(Number(e.target.value))}
              className="w-full accent-[#60A5FA]"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase mt-1">
              <span>3</span><span>4</span><span>5</span><span>6</span>
            </div>
          </div>

          {/* Textarea equipos */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
              <Users size={14} /> Equipos / Parejas
              <span className="text-slate-600 normal-case font-normal tracking-normal">
                — uno por línea o separados por comas
              </span>
            </label>
            <textarea
              value={textoEquipos}
              onChange={(e) => setTextoEquipos(e.target.value)}
              rows={10}
              placeholder={`EQUIPO ROJO\nEQUIPO AZUL\nLOS CRACKS\nSUPER FC\n...`}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-[#60A5FA] outline-none transition-colors resize-none"
            />
            {textoEquipos && (
              <p className="text-xs text-slate-500 mt-1 font-bold">
                {parsearEquipos().length} equipos detectados →{' '}
                {Math.ceil(parsearEquipos().length / tamGrupo)} grupos de ~{tamGrupo}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm font-bold">
              <AlertCircle size={18} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Botón preview */}
          <button
            onClick={generarPreview}
            className="w-full bg-[#60A5FA] hover:bg-blue-400 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(96,165,250,0.2)]"
          >
            <Wand2 size={20} /> Vista previa de grupos
          </button>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {fase === 'preview' && preview && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <Wand2 size={16} className="text-[#60A5FA]" />
              Vista previa — {preview.grupos.length} grupos generados
            </h4>
            <button onClick={() => setFase('idle')} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              ← Editar
            </button>
          </div>

          {/* Grid de grupos */}
          <div className="grid sm:grid-cols-2 gap-4">
            {preview.grupos.map((equipos, gi) => (
              <div key={gi} className="bg-[#0f172a] border border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-[#60A5FA]/10 border-b border-slate-700 px-4 py-2 text-[#60A5FA] text-xs font-black uppercase tracking-widest">
                  Grupo {letraGrupo(gi)} — {equipos.length} equipos
                </div>
                <ul className="divide-y divide-slate-800">
                  {equipos.map((eq, ei) => (
                    <li key={ei} className="px-4 py-2.5 text-sm font-bold text-slate-200 flex items-center gap-3">
                      <span className="text-slate-600 text-xs">{ei + 1}</span> {eq}
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-2 bg-slate-800/30 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {generarLiguilla(equipos).length} partidos de liguilla
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-400 space-y-1">
            <p><span className="text-white font-bold">Torneo:</span> {nombre}</p>
            <p><span className="text-white font-bold">Deporte:</span> {deporte}</p>
            <p><span className="text-white font-bold">Total equipos:</span> {preview.grupos.flat().length}</p>
            <p><span className="text-white font-bold">Total partidos de grupos:</span> {preview.grupos.reduce((acc, g) => acc + generarLiguilla(g).length, 0)}</p>
            <p className="text-amber-500 text-xs font-bold pt-1">
              ⚠ Las horas y pistas quedarán en blanco. Edítalas desde Resultados Pendientes.
            </p>
          </div>

          {/* Botón confirmar */}
          <button
            onClick={crearTorneo}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            ✅ Confirmar y crear en base de datos
          </button>
        </div>
      )}

      {/* ── LOADING ── */}
      {fase === 'loading' && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-12 h-12 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">
            Creando torneo...
          </p>
        </div>
      )}
    </div>
  );
}
