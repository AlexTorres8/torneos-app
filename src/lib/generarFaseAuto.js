import { supabase } from '../supabase';
import { calcularStats } from '../hooks/useCalcStats';
import { ordenarClasificacion } from './clasificacion';

/** Devuelve el equipo ganador de un partido finalizado, o null si hay empate. */
function getGanador(partido) {
  const gL = partido.puntuacion_local    ?? 0;
  const gV = partido.puntuacion_visitante ?? 0;
  if (gL > gV) return { id: partido.local_id,    nombre: partido.local?.nombre    ?? '?' };
  if (gV > gL) return { id: partido.visitante_id, nombre: partido.visitante?.nombre ?? '?' };
  return null;
}

/**
 * Genera la siguiente fase eliminatoria a partir de los ganadores de
 * la fase anterior (cuartos → semis, semis → final).
 *
 * Los partidos de origen deben estar ordenados por jornada.
 * Se emparejan de dos en dos: ganador(J1) vs ganador(J2), ganador(J3) vs ganador(J4)…
 */
function _generarDesdeFaseAnterior(fase, origen, torneoId) {
  if (origen.length % 2 !== 0) {
    throw new Error(`Número impar de partidos en la fase anterior (${origen.length}). No se puede generar ${fase} automáticamente.`);
  }

  const pares = [];
  for (let i = 0; i < origen.length; i += 2) {
    const p1 = origen[i];
    const p2 = origen[i + 1];
    const g1 = getGanador(p1);
    const g2 = getGanador(p2);
    if (!g1) throw new Error(`Empate en ${p1.local?.nombre ?? '?'} vs ${p1.visitante?.nombre ?? '?'}: no hay ganador. Corrige el resultado antes de generar la siguiente fase.`);
    if (!g2) throw new Error(`Empate en ${p2.local?.nombre ?? '?'} vs ${p2.visitante?.nombre ?? '?'}: no hay ganador. Corrige el resultado antes de generar la siguiente fase.`);
    pares.push({ etiq: `${g1.nombre} vs ${g2.nombre}`, local: g1, visitante: g2 });
  }

  const insertar = pares.map((p, i) => ({
    torneo_id: torneoId, fase, jornada: i + 1,
    hora: null, ubicacion: null, estado: 'pendiente',
    local_id: p.local.id, visitante_id: p.visitante.id,
  }));

  return { fase, preview: pares, insertar };
}

/**
 * Calcula qué partidos de fase eliminatoria deben crearse.
 *
 * Lógica de prioridad:
 *   1. Si semis existen y están todas finalizadas → genera final.
 *   2. Si cuartos existen y están todos finalizados → genera semis.
 *   3. Si playoffs existen y están todos finalizados → genera cuartos.
 *   4. Si ninguna fase eliminatoria existe → genera desde grupos.
 *
 * Devuelve { fase, preview, insertar } sin tocar la BD.
 * Llama a confirmarFaseAuto() para insertar.
 */
export async function calcularFaseAuto(torneoId, deporte) {
  // ── 0. Categoría del torneo (pádel PLATA no tiene ronda previa) ───────────
  const { data: torneoRow } = await supabase
    .from('torneos').select('categoria').eq('id', torneoId).single();
  const esPlata = deporte === 'padel' && torneoRow?.categoria === 'plata';

  // ── 1. Cargar grupos ──────────────────────────────────────────────────────
  const { data: grupos, error: e1 } = await supabase
    .from('grupos')
    .select('id, nombre, grupo_participantes(participantes(id, nombre))')
    .eq('torneo_id', torneoId)
    .order('nombre');
  if (e1) throw new Error('Error cargando grupos: ' + e1.message);
  if (!grupos?.length) throw new Error('Este torneo no tiene grupos creados.');

  // ── 2. Cargar partidos (con nombres de equipos para las fases knock-out) ──
  const { data: partidos, error: e2 } = await supabase
    .from('partidos')
    .select([
      'id', 'estado', 'fase', 'jornada',
      'local_id', 'visitante_id',
      'puntuacion_local', 'puntuacion_visitante', 'detalle_resultado',
      'local:participantes!local_id(id, nombre)',
      'visitante:participantes!visitante_id(id, nombre)',
    ].join(', '))
    .eq('torneo_id', torneoId);
  if (e2) throw new Error('Error cargando partidos: ' + e2.message);

  const todos = partidos ?? [];

  const byFase = (fase) => todos.filter(p => p.fase === fase).sort((a, b) => a.jornada - b.jornada);
  const cuartos  = byFase('cuartos');
  const semis    = byFase('semis');
  const finales  = byFase('final');
  const playoffs = byFase('playoffs');

  // ── 3. Prioridad: generar final desde semis finalizadas ───────────────────
  if (semis.length > 0) {
    if (finales.length > 0) throw new Error('La final ya existe en este torneo.');
    const pendientes = semis.filter(p => p.estado !== 'finalizado');
    if (pendientes.length > 0) {
      const desc = pendientes.map(p => `${p.local?.nombre ?? '?'} vs ${p.visitante?.nombre ?? '?'}`).join(' · ');
      throw new Error(`Faltan ${pendientes.length} semifinal(es) por finalizar: ${desc}`);
    }
    return _generarDesdeFaseAnterior('final', semis, torneoId);
  }

  // ── 4. Generar semis desde cuartos finalizados ────────────────────────────
  if (cuartos.length > 0) {
    if (semis.length > 0) throw new Error('Las semifinales ya existen en este torneo.');
    const pendientes = cuartos.filter(p => p.estado !== 'finalizado');
    if (pendientes.length > 0) {
      const desc = pendientes.map(p => `${p.local?.nombre ?? '?'} vs ${p.visitante?.nombre ?? '?'}`).join(' · ');
      throw new Error(`Faltan ${pendientes.length} cuarto(s) de final por finalizar: ${desc}`);
    }
    return _generarDesdeFaseAnterior('semis', cuartos, torneoId);
  }

  // ── 5. Generar cuartos desde playoffs finalizados (pádel) ─────────────────
  if (playoffs.length > 0) {
    if (cuartos.length > 0) throw new Error('Los cuartos de final ya existen en este torneo.');
    const pendientes = playoffs.filter(p => p.estado !== 'finalizado');
    if (pendientes.length > 0) {
      const desc = pendientes.map(p => `${p.local?.nombre ?? '?'} vs ${p.visitante?.nombre ?? '?'}`).join(' · ');
      throw new Error(`Faltan ${pendientes.length} partido(s) de la ronda previa por finalizar: ${desc}`);
    }
    return _generarDesdeFaseAnterior('cuartos', playoffs, torneoId);
  }

  // ── 6. Generar primera fase desde clasificaciones de grupos ───────────────
  const grupales    = todos.filter(p => p.fase === 'grupos');
  const finalizados = grupales.filter(p => p.estado === 'finalizado');

  if (!finalizados.length) {
    throw new Error('No hay partidos de grupos finalizados todavía.');
  }

  // grupos ya viene ordenado por nombre desde Supabase (.order('nombre'))
  const clasificaciones = grupos.map(g => {
    const conStats = g.grupo_participantes.map(gp => ({
      ...gp.participantes,
      stats: calcularStats(todos, gp.participantes.id, deporte),
    }));
    return {
      nombre: g.nombre,
      equipos: ordenarClasificacion(conStats, todos, deporte),
    };
  });

  const nGrupos = clasificaciones.length;
  let fase, pares;

  if (nGrupos === 2 && deporte === 'padel' && !esPlata) {
    const [ga, gb] = clasificaciones;
    fase  = 'playoffs';
    pares = [
      { etiq: `2º ${ga.nombre} vs 3º ${gb.nombre}`, local: ga.equipos[1], visitante: gb.equipos[2] },
      { etiq: `2º ${gb.nombre} vs 3º ${ga.nombre}`, local: gb.equipos[1], visitante: ga.equipos[2] },
    ];

  } else if (nGrupos === 2) {
    const [ga, gb] = clasificaciones;
    const tamGrupo  = Math.max(ga.equipos.length, gb.equipos.length);
    if (tamGrupo >= 4) {
      fase  = 'cuartos';
      pares = [
        { etiq: `1º ${ga.nombre} vs 4º ${gb.nombre}`, local: ga.equipos[0], visitante: gb.equipos[3] },
        { etiq: `2º ${gb.nombre} vs 3º ${ga.nombre}`, local: gb.equipos[1], visitante: ga.equipos[2] },
        { etiq: `1º ${gb.nombre} vs 4º ${ga.nombre}`, local: gb.equipos[0], visitante: ga.equipos[3] },
        { etiq: `2º ${ga.nombre} vs 3º ${gb.nombre}`, local: ga.equipos[1], visitante: gb.equipos[2] },
      ];
    } else {
      fase  = 'semis';
      pares = [
        { etiq: `1º ${ga.nombre} vs 2º ${gb.nombre}`, local: ga.equipos[0], visitante: gb.equipos[1] },
        { etiq: `1º ${gb.nombre} vs 2º ${ga.nombre}`, local: gb.equipos[0], visitante: ga.equipos[1] },
      ];
    }

  } else if (nGrupos === 3) {
    const [ga, gb, gc] = clasificaciones;
    const terceros = clasificaciones
      .filter(g => g.equipos.length >= 3)
      .map(g => g.equipos[2])
      .sort((a, b) =>
        b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf
      );
    if (terceros.length < 2) throw new Error('Faltan resultados para calcular los 2 mejores terceros.');
    fase  = 'cuartos';
    pares = [
      { etiq: `1º ${ga.nombre} vs Mejor 3º`,        local: ga.equipos[0], visitante: terceros[0]   },
      { etiq: `2º ${gc.nombre} vs 2º ${gb.nombre}`, local: gc.equipos[1], visitante: gb.equipos[1] },
      { etiq: `1º ${gb.nombre} vs 2º Mejor 3º`,     local: gb.equipos[0], visitante: terceros[1]   },
      { etiq: `1º ${gc.nombre} vs 2º ${ga.nombre}`, local: gc.equipos[0], visitante: ga.equipos[1] },
    ];

  } else if (nGrupos === 4 && esPlata) {
    // Pádel PLATA: sin ronda previa, cuartos directos con 1º y 2º de cada grupo.
    const [ga, gb, gc, gd] = clasificaciones;
    fase  = 'cuartos';
    pares = [
      { etiq: `1º ${ga.nombre} vs 2º ${gb.nombre}`, local: ga.equipos[0], visitante: gb.equipos[1] },
      { etiq: `1º ${gc.nombre} vs 2º ${gd.nombre}`, local: gc.equipos[0], visitante: gd.equipos[1] },
      { etiq: `1º ${gb.nombre} vs 2º ${ga.nombre}`, local: gb.equipos[0], visitante: ga.equipos[1] },
      { etiq: `1º ${gd.nombre} vs 2º ${gc.nombre}`, local: gd.equipos[0], visitante: gc.equipos[1] },
    ];

  } else if (nGrupos === 4) {
    const [ga, gb, gc, gd] = clasificaciones;
    fase  = 'playoffs';
    pares = [
      { etiq: `2º ${ga.nombre} vs 3º ${gc.nombre}`, local: ga.equipos[1], visitante: gc.equipos[2] },
      { etiq: `2º ${gb.nombre} vs 3º ${gd.nombre}`, local: gb.equipos[1], visitante: gd.equipos[2] },
      { etiq: `2º ${gc.nombre} vs 3º ${ga.nombre}`, local: gc.equipos[1], visitante: ga.equipos[2] },
      { etiq: `2º ${gd.nombre} vs 3º ${gb.nombre}`, local: gd.equipos[1], visitante: gb.equipos[2] },
    ];

  } else {
    throw new Error(`No hay regla automática para ${nGrupos} grupos.`);
  }

  pares = pares.filter(p => p.local?.id && p.visitante?.id);
  if (!pares.length) {
    throw new Error('No hay suficientes resultados finalizados para determinar los clasificados.');
  }

  const insertar = pares.map((p, i) => ({
    torneo_id: torneoId, fase, jornada: i + 1,
    hora: null, ubicacion: null, estado: 'pendiente',
    local_id: p.local.id, visitante_id: p.visitante.id,
  }));

  return { fase, preview: pares, insertar };
}

/** Inserta los partidos calculados por calcularFaseAuto. */
export async function confirmarFaseAuto(insertar) {
  const { error } = await supabase.from('partidos').insert(insertar);
  if (error) throw new Error('Error creando partidos: ' + error.message);
}
