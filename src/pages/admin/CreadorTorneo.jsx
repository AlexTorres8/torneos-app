import { useState } from 'react';
import { Wand2, Users, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { sanitizarNombre, sanitizarEquipo } from '../../lib/sanitize';
import { checkRateLimit } from '../../lib/rateLimit';

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

/**
 * Genera el calendario de liga a una vuelta por jornadas (método del círculo).
 * Si el número de equipos es impar, cada jornada descansa un equipo distinto.
 * Devuelve un array de jornadas, cada una con los partidos de esa ronda.
 */
function generarCalendarioJornadas(equipos) {
  const impar = equipos.length % 2 !== 0;
  const lista = impar ? [...equipos, null] : [...equipos]; // null = equipo que descansa
  const total = lista.length;
  const jornadas = [];

  for (let ronda = 0; ronda < total - 1; ronda++) {
    const partidosRonda = [];
    for (let i = 0; i < total / 2; i++) {
      const a = lista[i];
      const b = lista[total - 1 - i];
      if (a !== null && b !== null) partidosRonda.push({ local: a, visitante: b });
    }
    jornadas.push(partidosRonda);
    lista.splice(1, 0, lista.pop());
  }
  return jornadas;
}

/** Nombre de grupo por índice: A, B, C … */
const letraGrupo = (i) => String.fromCharCode(65 + i);

const SEDES_POR_DEPORTE = {
  futsal: ['Pista Exterior', 'Pabellón'],
  padel:  ['Pista 1', 'Pista 2'],
};
// Franjas horarias automáticas por deporte (hasta 3 franjas, 2 sedes por franja).
// El admin solo elige cuántos partidos por jornada (1-6); la web asigna hora y
// sede: partidos 1-2 en la franja 1, 3-4 en la franja 2, 5-6 en la franja 3.
const FRANJAS_BASE = {
  futsal: ['20:30', '21:30', '22:30'],
  padel:  ['19:30', '21:00', '22:30'],
};
const PARTIDOS_JORNADA_DEFECTO = 4;

/**
 * Franjas efectivas según deporte/categoría/capacidad.
 * Caso especial: pádel ORO con 1 solo partido por jornada → 21:00.
 */
function franjasPara(deporte, categoria, capacidad) {
  if (deporte === 'padel' && categoria === 'oro' && capacidad === 1) return ['21:00'];
  return FRANJAS_BASE[deporte] ?? FRANJAS_BASE.futsal;
}

/**
 * Asigna hora y sede a TODOS los partidos de la liguilla, para cualquier número
 * de grupos (futsal o pádel).
 *
 * Los partidos se empaquetan en jornadas de capacidad fija (1-6 partidos, la
 * elige el admin): en cada franja horaria se ocupan las 2 sedes (2 partidos a
 * la vez). Un equipo/pareja juega como máximo una vez por jornada,
 * así nunca coincide consigo mismo en dos horarios. Los partidos que no llenan
 * una jornada completa se colocan en una jornada extra final.
 *
 * Los equipos que descansan (byes por número impar) ya vienen excluidos de
 * `jornadasPorGrupo`.
 */
function asignarHorario(jornadasPorGrupo, deporte = 'futsal', capacidad = PARTIDOS_JORNADA_DEFECTO, horariosOverride = null) {
  const sedes    = SEDES_POR_DEPORTE[deporte]  ?? SEDES_POR_DEPORTE.futsal;
  const horarios = horariosOverride ?? FRANJAS_BASE[deporte] ?? FRANJAS_BASE.futsal;
  const V = sedes.length;

  // Todos los cruces de la liguilla, recorriendo las rondas e intercalando
  // grupos (A1, B1, C1, A2…) para repartir el reparto entre jornadas.
  const todos = [];
  const maxRondas = jornadasPorGrupo.reduce((max, j) => Math.max(max, j.length), 0);
  for (let r = 0; r < maxRondas; r++) {
    jornadasPorGrupo.forEach((jornadas, gi) => {
      (jornadas[r] || []).forEach((cruce) => todos.push({ ...cruce, grupoIdx: gi }));
    });
  }

  // Empaquetar en jornadas de capacidad fija; cada equipo, máximo una vez por
  // jornada. Los sobrantes abren una jornada nueva (la última puede ir a medias).
  const jornadas = []; // { equipos:Set, cruces:[] }
  for (const cruce of todos) {
    let colocado = false;
    for (const j of jornadas) {
      if (
        j.cruces.length < capacidad &&
        !j.equipos.has(cruce.local) &&
        !j.equipos.has(cruce.visitante)
      ) {
        j.cruces.push(cruce);
        j.equipos.add(cruce.local);
        j.equipos.add(cruce.visitante);
        colocado = true;
        break;
      }
    }
    if (!colocado) {
      jornadas.push({ equipos: new Set([cruce.local, cruce.visitante]), cruces: [cruce] });
    }
  }

  // Asignar hora y sede dentro de cada jornada: 2 partidos por franja horaria.
  const partidos = [];
  jornadas.forEach((j, ji) => {
    j.cruces.forEach((cruce, p) => {
      partidos.push({
        ...cruce,
        jornada:   ji + 1,
        hora:      horarios[Math.floor(p / V)] ?? horarios[horarios.length - 1],
        ubicacion: sedes[p % V],
      });
    });
  });
  return partidos;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export default function CreadorTorneo({ onTorneoCreado }) {
  const [nombre,      setNombre]      = useState('');
  const [deporte,     setDeporte]     = useState('futsal');
  const [categoria,   setCategoria]   = useState('global'); // solo pádel: oro | plata | global
  const [textoEquipos,setTextoEquipos]= useState('');
  const [tamGrupo,    setTamGrupo]    = useState(4);
  const [partidosJornada, setPartidosJornada] = useState(PARTIDOS_JORNADA_DEFECTO); // 1-6
  const [estado,      setEstado]      = useState('Inscripciones abiertas');
  const [fase,        setFase]        = useState('idle'); // idle | preview | loading | done | error
  const [preview,     setPreview]     = useState(null);   // { grupos: [[nombres]] }
  const [error,       setError]       = useState('');

  // ── Parsear equipos del textarea ──────────────────────────────────────────
  const parsearEquipos = () => {
    const limpios = textoEquipos
      .split(/[\n,]+/)
      .map((e) => sanitizarEquipo(e))
      .filter(Boolean);
    // Dedupe (case-insensitive): dentro de un torneo el nombre debe ser único
    const vistos = new Set();
    return limpios.filter((n) => {
      const k = n.toLowerCase();
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
  };

  // ── Generar preview (sin tocar la BD) ─────────────────────────────────────
  const generarPreview = () => {
    setError('');
    const { ok, resetIn } = checkRateLimit('crear-torneo', 10, 60_000);
    if (!ok) { setError(`Demasiadas acciones. Espera ${resetIn}s e inténtalo de nuevo.`); return; }

    const equipos = parsearEquipos();
    if (!nombre.trim()) { setError('Escribe un nombre para el torneo.'); return; }
    if (equipos.length < 4) { setError('Necesitas al menos 4 equipos/parejas.'); return; }

    const mezclados      = shuffle(equipos);
    const grupos         = repartirEnGrupos(mezclados, tamGrupo);
    const jornadasPorGrupo = grupos.map((g) => generarCalendarioJornadas(g));
    const calendario     = asignarHorario(
      jornadasPorGrupo, deporte, partidosJornada,
      franjasPara(deporte, deporte === 'padel' ? categoria : null, partidosJornada)
    );

    setPreview({ grupos, jornadasPorGrupo, calendario });
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
        .insert([{
          nombre: sanitizarNombre(nombre),
          deporte,
          estado,
          formato: 'liga',
          categoria: deporte === 'padel' ? categoria : null,
        }])
        .select()
        .single();
      if (e1) throw new Error('Error creando torneo: ' + e1.message);
      const tId = torneo.id;

      // 2. Grupos
      const insGrupos = preview.grupos.map((_, i) => ({ torneo_id: tId, nombre: `GRUPO ${letraGrupo(i)}` }));
      const { data: gruposDB, error: e2 } = await supabase
        .from('grupos')
        .insert(insGrupos)
        .select();
      if (e2) throw new Error('Error creando grupos: ' + e2.message);

      // 3. Participantes (con alcance de torneo; nombre único por torneo)
      const todosNombres = preview.grupos.flat();
      const { data: participantesDB, error: e3 } = await supabase
        .from('participantes')
        .insert(todosNombres.map((n) => ({ nombre: n, torneo_id: tId })))
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

      // 5. Insertar los partidos exactamente como se mostraron en la vista previa
      //    (hora y sede ya asignadas por rejilla sede × franja).
      const partidos = preview.calendario.map((p) => ({
        torneo_id:    tId,
        fase:         'grupos',
        jornada:      p.jornada,
        hora:         p.hora,
        ubicacion:    p.ubicacion,
        estado:       'pendiente',
        local_id:     idPor(p.local),
        visitante_id: idPor(p.visitante),
      }));

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
    setNombre(''); setDeporte('futsal'); setCategoria('global'); setTextoEquipos('');
    setTamGrupo(4); setEstado('Inscripciones abiertas');
    setPartidosJornada(PARTIDOS_JORNADA_DEFECTO);
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
              maxLength={60}
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

          {/* Categoría (solo pádel) */}
          {deporte === 'padel' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Categoría
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'global', l: '🌐 Global' },
                  { v: 'oro',    l: '🏆 Oro'    },
                  { v: 'plata',  l: '🥈 Plata'  },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCategoria(v)}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                      categoria === v
                        ? 'bg-[#60A5FA] text-black border-[#60A5FA] shadow-lg'
                        : 'bg-[#0f172a] text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                Global: torneo mixto (oro + plata) con pocos participantes.
              </p>
            </div>
          )}

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

          {/* Partidos por jornada (horario automático) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Partidos por jornada: <span className="text-[#60A5FA]">{partidosJornada}</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPartidosJornada(n)}
                  className={`py-2.5 rounded-xl text-sm font-black border transition-all ${
                    partidosJornada === n
                      ? 'bg-[#60A5FA] text-black border-[#60A5FA] shadow-lg'
                      : 'bg-[#0f172a] text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
              Horario automático: {franjasPara(deporte, deporte === 'padel' ? categoria : null, partidosJornada).slice(0, Math.ceil(partidosJornada / 2)).join(' / ')}
              {partidosJornada > 1 && <> — 2 partidos a la vez ({SEDES_POR_DEPORTE[deporte].join(' y ')})</>}.
            </p>
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
                  {generarLiguilla(equipos).length} partidos de liguilla en {generarCalendarioJornadas(equipos).length} jornadas
                  {equipos.length % 2 !== 0 && ' (1 equipo descansa cada jornada)'}
                </div>
              </div>
            ))}
          </div>

          {/* Calendario con hora y sede — se genera siempre */}
          {preview.calendario.length > 0 && (
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                <Wand2 size={16} className="text-[#60A5FA]" /> Calendario generado
              </h4>
              <div className="space-y-3">
                {[...new Set(preview.calendario.map((p) => p.jornada))].map((jornada) => (
                  <div key={jornada} className="bg-[#0f172a] border border-slate-700 rounded-xl p-4">
                    <p className="text-[#60A5FA] text-xs font-black uppercase tracking-widest mb-2">Jornada {jornada}</p>
                    <div className="space-y-1.5">
                      {preview.calendario
                        .filter((p) => p.jornada === jornada)
                        .sort((a, b) => a.hora.localeCompare(b.hora) || a.grupoIdx - b.grupoIdx)
                        .map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-200 font-bold truncate pr-2">
                            <span className="text-slate-600 mr-1">Grupo {letraGrupo(p.grupoIdx)}</span>
                            {p.local} <span className="text-slate-500">vs</span> {p.visitante}
                          </span>
                          <span className="text-slate-500 text-xs font-bold flex-shrink-0">{p.hora} · {p.ubicacion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-400 space-y-1">
            <p><span className="text-white font-bold">Torneo:</span> {nombre}</p>
            <p><span className="text-white font-bold">Deporte:</span> {deporte}</p>
            <p><span className="text-white font-bold">Total equipos:</span> {preview.grupos.flat().length}</p>
            <p><span className="text-white font-bold">Total partidos de grupos:</span> {preview.grupos.reduce((acc, g) => acc + generarLiguilla(g).length, 0)}</p>
            <p className="text-slate-500 text-xs pt-1">
              Horas y pistas se asignan automáticamente. Podrás editarlas después desde Resultados Pendientes.
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
