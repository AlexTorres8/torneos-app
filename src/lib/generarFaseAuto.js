import { supabase } from '../supabase';
import { calcularStats } from '../hooks/useCalcStats';

/**
 * Calcula qué partidos de fase final deben crearse en función de las
 * clasificaciones actuales de grupos.
 *
 * Devuelve { fase, preview, insertar } sin tocar la BD.
 * Llama a confirmarFaseAuto() para insertar.
 */
export async function calcularFaseAuto(torneoId, deporte) {
  // ── 1. Cargar grupos ──────────────────────────────────────────────────────
  const { data: grupos, error: e1 } = await supabase
    .from('grupos')
    .select('id, nombre, grupo_participantes(participantes(id, nombre))')
    .eq('torneo_id', torneoId)
    .order('nombre');
  if (e1) throw new Error('Error cargando grupos: ' + e1.message);
  if (!grupos?.length) throw new Error('Este torneo no tiene grupos creados.');

  // ── 2. Cargar partidos ────────────────────────────────────────────────────
  const { data: partidos, error: e2 } = await supabase
    .from('partidos')
    .select('id, estado, fase, local_id, visitante_id, puntuacion_local, puntuacion_visitante, detalle_resultado')
    .eq('torneo_id', torneoId);
  if (e2) throw new Error('Error cargando partidos: ' + e2.message);

  const grupales = partidos?.filter(p => p.fase === 'grupos') ?? [];
  const finalizados = grupales.filter(p => p.estado === 'finalizado');

  if (!finalizados.length) {
    throw new Error('No hay partidos de grupos finalizados todavía.');
  }

  // ── 3. Clasificar cada grupo ──────────────────────────────────────────────
  const clasificaciones = grupos
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map(g => ({
      nombre: g.nombre,
      equipos: g.grupo_participantes
        .map(gp => ({
          ...gp.participantes,
          stats: calcularStats(partidos, gp.participantes.id, deporte),
        }))
        .sort((a, b) =>
          b.stats.pts - a.stats.pts ||
          b.stats.dif - a.stats.dif ||
          (b.stats.jdif ?? 0) - (a.stats.jdif ?? 0) ||
          b.stats.gf  - a.stats.gf
        ),
    }));

  const nGrupos = clasificaciones.length;

  // ── 4. Construir emparejamientos según estructura ─────────────────────────
  let fase, pares;

  if (nGrupos === 2) {
    const [ga, gb] = clasificaciones;
    const tamGrupo  = Math.max(ga.equipos.length, gb.equipos.length);

    if (tamGrupo >= 4) {
      // 8+ equipos: cuartos cruzados 1ºA-4ºB / 2ºB-3ºA / 1ºB-4ºA / 2ºA-3ºB
      fase  = 'cuartos';
      pares = [
        { etiq: `1º ${ga.nombre} vs 4º ${gb.nombre}`, local: ga.equipos[0], visitante: gb.equipos[3] },
        { etiq: `2º ${gb.nombre} vs 3º ${ga.nombre}`, local: gb.equipos[1], visitante: ga.equipos[2] },
        { etiq: `1º ${gb.nombre} vs 4º ${ga.nombre}`, local: gb.equipos[0], visitante: ga.equipos[3] },
        { etiq: `2º ${ga.nombre} vs 3º ${gb.nombre}`, local: ga.equipos[1], visitante: gb.equipos[2] },
      ];
    } else {
      // 6 equipos: semifinales directas 1ºA-2ºB / 1ºB-2ºA
      fase  = 'semis';
      pares = [
        { etiq: `1º ${ga.nombre} vs 2º ${gb.nombre}`, local: ga.equipos[0], visitante: gb.equipos[1] },
        { etiq: `1º ${gb.nombre} vs 2º ${ga.nombre}`, local: gb.equipos[0], visitante: ga.equipos[1] },
      ];
    }

  } else if (nGrupos === 3) {
    // Torneo 24h: cuartos con los 2 mejores terceros
    const [ga, gb, gc] = clasificaciones;
    const terceros = clasificaciones
      .filter(g => g.equipos.length >= 3)
      .map(g => g.equipos[2])
      .sort((a, b) =>
        b.stats.pts - a.stats.pts ||
        b.stats.dif - a.stats.dif ||
        b.stats.gf  - a.stats.gf
      );

    if (terceros.length < 2) {
      throw new Error('Faltan resultados para calcular los 2 mejores terceros.');
    }

    fase  = 'cuartos';
    pares = [
      { etiq: `1º ${ga.nombre} vs Mejor 3º`,          local: ga.equipos[0], visitante: terceros[0]    },
      { etiq: `2º ${gc.nombre} vs 2º ${gb.nombre}`,   local: gc.equipos[1], visitante: gb.equipos[1]  },
      { etiq: `1º ${gb.nombre} vs 2º Mejor 3º`,       local: gb.equipos[0], visitante: terceros[1]    },
      { etiq: `1º ${gc.nombre} vs 2º ${ga.nombre}`,   local: gc.equipos[0], visitante: ga.equipos[1]  },
    ];

  } else if (nGrupos === 4) {
    // Pádel (4 grupos): ronda previa (playoffs)
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

  // Filtrar emparejamientos incompletos (equipo sin ID)
  pares = pares.filter(p => p.local?.id && p.visitante?.id);

  if (!pares.length) {
    throw new Error('No hay suficientes resultados finalizados para determinar los clasificados.');
  }

  // ── 5. Comprobar que la fase no existe ya ─────────────────────────────────
  const yaExistentes = partidos?.filter(p => p.fase === fase) ?? [];
  if (yaExistentes.length > 0) {
    throw new Error(
      `Ya existen ${yaExistentes.length} partido(s) de ${fase} en este torneo. ` +
      `Elimínalos desde la base de datos antes de regenerar.`
    );
  }

  // ── 6. Preparar objetos para insertar ────────────────────────────────────
  const insertar = pares.map((p, i) => ({
    torneo_id:    torneoId,
    fase,
    jornada:      i + 1,
    hora:         null,
    ubicacion:    null,
    estado:       'pendiente',
    local_id:     p.local.id,
    visitante_id: p.visitante.id,
  }));

  return { fase, preview: pares, insertar };
}

/** Inserta los partidos calculados por calcularFaseAuto. */
export async function confirmarFaseAuto(insertar) {
  const { error } = await supabase.from('partidos').insert(insertar);
  if (error) throw new Error('Error creando partidos: ' + error.message);
}
