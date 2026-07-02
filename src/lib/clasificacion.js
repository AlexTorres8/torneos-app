/**
 * Ordenación de clasificación de grupo con desempate correcto para
 * empates de 2 O MÁS equipos (mini-liga entre los implicados).
 *
 * Funciona para Futsal y Pádel. Los `equipos` deben venir con `.id` y
 * `.stats` ya calculados por calcularStats().
 *
 * Criterios de desempate (normativa habitual):
 *   1. Puntos totales
 *   2. Entre los empatados: mini-liga (solo partidos entre ellos)
 *        a. Puntos en la mini-liga
 *        b. Diferencia de goles/sets en la mini-liga
 *        c. (pádel) Diferencia de juegos en la mini-liga
 *   3. Diferencia de goles/sets total
 *   4. (pádel) Diferencia de juegos total
 *   5. Goles/sets a favor totales
 *
 * Para un empate de exactamente 2 equipos, la mini-liga equivale al
 * enfrentamiento directo, manteniendo el comportamiento anterior.
 */

/** Suma juegos a favor/en contra de un partido de pádel para un id. */
function juegosPartido(p, esLocal) {
  let jf = 0, jc = 0;
  if (p.detalle_resultado) {
    p.detalle_resultado.split(',').forEach((set) => {
      const partes = set.trim().split(/[-/]+/);
      const a = parseInt(partes[0]) || 0;
      const b = parseInt(partes[1]) || 0;
      if (esLocal) { jf += a; jc += b; } else { jf += b; jc += a; }
    });
  }
  return { jf, jc };
}

/** Ordena un subconjunto de equipos empatados a puntos usando la mini-liga. */
function desempatarGrupo(empatados, partidos, deporte) {
  if (empatados.length <= 1) return empatados;

  const ids = new Set(empatados.map((e) => e.id));
  const mini = {};
  empatados.forEach((e) => { mini[e.id] = { pts: 0, gf: 0, gc: 0, jf: 0, jc: 0 }; });

  partidos
    .filter((p) =>
      p.fase === 'grupos' &&
      p.estado === 'finalizado' &&
      ids.has(p.local_id) &&
      ids.has(p.visitante_id)
    )
    .forEach((p) => {
      const gl = Number(p.puntuacion_local);
      const gv = Number(p.puntuacion_visitante);
      const L = mini[p.local_id];
      const V = mini[p.visitante_id];
      L.gf += gl; L.gc += gv;
      V.gf += gv; V.gc += gl;

      if (gl > gv) {
        L.pts += 3;
        if (deporte === 'padel') V.pts += 1;
      } else if (gv > gl) {
        V.pts += 3;
        if (deporte === 'padel') L.pts += 1;
      } else {
        L.pts += 1;
        V.pts += 1;
      }

      if (deporte === 'padel') {
        const jl = juegosPartido(p, true);
        const jv = juegosPartido(p, false);
        L.jf += jl.jf; L.jc += jl.jc;
        V.jf += jv.jf; V.jc += jv.jc;
      }
    });

  return [...empatados].sort((a, b) => {
    const ma = mini[a.id], mb = mini[b.id];
    if (mb.pts !== ma.pts) return mb.pts - ma.pts;

    const mdifA = ma.gf - ma.gc, mdifB = mb.gf - mb.gc;
    if (mdifB !== mdifA) return mdifB - mdifA;

    if (deporte === 'padel') {
      const mjA = ma.jf - ma.jc, mjB = mb.jf - mb.jc;
      if (mjB !== mjA) return mjB - mjA;
    }

    // Fallback a estadísticas totales
    if (b.stats.dif !== a.stats.dif) return b.stats.dif - a.stats.dif;
    if (deporte === 'padel' && (b.stats.jdif ?? 0) !== (a.stats.jdif ?? 0)) {
      return (b.stats.jdif ?? 0) - (a.stats.jdif ?? 0);
    }
    return b.stats.gf - a.stats.gf;
  });
}

/**
 * Ordena una lista de equipos (con `.stats`) aplicando el desempate por
 * mini-liga a cada bloque de equipos igualados a puntos.
 *
 * @param {Array}  equipos  - [{ id, stats, ... }]
 * @param {Array}  partidos - todos los partidos del torneo
 * @param {string} deporte  - 'futsal' | 'padel'
 * @returns {Array} equipos ordenados
 */
export function ordenarClasificacion(equipos, partidos, deporte = 'futsal') {
  const byPts = [...equipos].sort((a, b) => b.stats.pts - a.stats.pts);
  const out = [];

  let i = 0;
  while (i < byPts.length) {
    let j = i;
    while (j + 1 < byPts.length && byPts[j + 1].stats.pts === byPts[i].stats.pts) j++;
    const bloque = byPts.slice(i, j + 1);
    out.push(...(bloque.length > 1 ? desempatarGrupo(bloque, partidos, deporte) : bloque));
    i = j + 1;
  }

  return out;
}
