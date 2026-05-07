import { useMemo } from 'react';

/**
 * Calcula estadísticas de un participante a partir de sus partidos.
 * Funciona para Futsal y Pádel.
 *
 * Para PÁDEL devuelve además:
 *   - jf: juegos a favor  (suma de juegos ganados en todos los sets)
 *   - jc: juegos en contra
 *   - jdif: diferencia de juegos
 *
 * Esto permite aplicar el desempate correcto según la normativa oficial:
 *   1. Puntos
 *   2. Partido directo entre empatados (se resuelve en el componente)
 *   3. Set-average (dif = sets ganados - sets perdidos, equivale a gf - gc)
 *   4. Juego-average (jdif = juegos ganados - juegos perdidos)
 *   5. GF (sets ganados totales, como último criterio numérico)
 *
 * @param {Array}  partidos       - Todos los partidos del torneo
 * @param {string} participanteId - ID del participante
 * @param {string} deporte        - 'futsal' | 'padel'
 * @returns {Object} stats
 */
export function useCalcStats(partidos, participanteId, deporte = 'futsal') {
  return useMemo(
    () => _calcular(partidos, participanteId, deporte),
    [partidos, participanteId, deporte]
  );
}

/** Versión función pura (sin hook) — usar fuera de componentes. */
export function calcularStats(partidos, participanteId, deporte = 'futsal') {
  return _calcular(partidos, participanteId, deporte);
}

// ── Implementación compartida ──────────────────────────────────────────────
function _calcular(partidos, participanteId, deporte) {
  let s = {
    pj: 0, pg: 0, pe: 0, pp: 0,
    pts: 0,
    gf: 0, gc: 0, dif: 0,
    // Solo pádel — juego-average para desempate de normativa
    jf: 0, jc: 0, jdif: 0,
  };

  partidos
    .filter(
      (p) =>
        p.fase === 'grupos' &&
        p.estado === 'finalizado' &&
        (p.local_id === participanteId || p.visitante_id === participanteId)
    )
    .forEach((p) => {
      s.pj++;
      const esLocal = p.local_id === participanteId;
      const gf = Number(esLocal ? p.puntuacion_local    : p.puntuacion_visitante);
      const gc = Number(esLocal ? p.puntuacion_visitante : p.puntuacion_local);
      s.gf += gf;
      s.gc += gc;

      if (gf > gc) {
        s.pts += 3;
        s.pg++;
      } else if (gf === gc) {
        s.pts += 1;
        s.pe++;
      } else {
        // En pádel el perdedor suma 1 punto (normativa oficial)
        if (deporte === 'padel') s.pts += 1;
        s.pp++;
      }

      // ── Juego-average para pádel ────────────────────────────────────
      if (deporte === 'padel' && p.detalle_resultado) {
        const sets = p.detalle_resultado
          .split(',')
          .map((set) => {
            const partes = set.trim().split(/[-/]+/);
            return {
              a: parseInt(partes[0]) || 0,
              b: parseInt(partes[1]) || 0,
            };
          });

        sets.forEach((set) => {
          if (esLocal) {
            s.jf += set.a;
            s.jc += set.b;
          } else {
            s.jf += set.b;
            s.jc += set.a;
          }
        });
      }
    });

  s.dif  = s.gf - s.gc;
  s.jdif = s.jf - s.jc;
  return s;
}
