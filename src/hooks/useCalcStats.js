import { useMemo } from 'react';

/**
 * Hook reutilizable para calcular estadísticas de un participante
 * a partir de sus partidos. Funciona para Futsal y Pádel.
 *
 * @param {Array} partidos - Lista de todos los partidos del torneo
 * @param {string} participanteId - ID del participante a calcular
 * @param {string} deporte - 'futsal' | 'padel' (afecta al sistema de puntos)
 * @returns {Object} stats - { pj, pg, pe, pp, pts, gf, gc, dif }
 */
export function useCalcStats(partidos, participanteId, deporte = 'futsal') {
  return useMemo(() => {
    let s = { pj: 0, pg: 0, pe: 0, pp: 0, pts: 0, gf: 0, gc: 0, dif: 0 };

    partidos
      .filter(
        (p) =>
          p.fase === 'grupos' &&
          p.estado === 'finalizado' &&
          (p.local_id === participanteId || p.visitante_id === participanteId)
      )
      .forEach((p) => {
        s.pj++;
        const gf = Number(
          p.local_id === participanteId ? p.puntuacion_local : p.puntuacion_visitante
        );
        const gc = Number(
          p.local_id === participanteId ? p.puntuacion_visitante : p.puntuacion_local
        );
        s.gf += gf;
        s.gc += gc;

        if (gf > gc) {
          s.pts += 3;
          s.pg++;
        } else if (gf === gc) {
          s.pts += 1;
          s.pe++;
        } else {
          // En pádel el perdedor también suma 1 punto
          if (deporte === 'padel') s.pts += 1;
          s.pp++;
        }
      });

    s.dif = s.gf - s.gc;
    return s;
  }, [partidos, participanteId, deporte]);
}

/**
 * Versión sin hook (función pura) para usar fuera de componentes,
 * por ejemplo al ordenar arrays antes de renderizar.
 */
export function calcularStats(partidos, participanteId, deporte = 'futsal') {
  let s = { pj: 0, pg: 0, pe: 0, pp: 0, pts: 0, gf: 0, gc: 0, dif: 0 };

  partidos
    .filter(
      (p) =>
        p.fase === 'grupos' &&
        p.estado === 'finalizado' &&
        (p.local_id === participanteId || p.visitante_id === participanteId)
    )
    .forEach((p) => {
      s.pj++;
      const gf = Number(
        p.local_id === participanteId ? p.puntuacion_local : p.puntuacion_visitante
      );
      const gc = Number(
        p.local_id === participanteId ? p.puntuacion_visitante : p.puntuacion_local
      );
      s.gf += gf;
      s.gc += gc;

      if (gf > gc) {
        s.pts += 3;
        s.pg++;
      } else if (gf === gc) {
        s.pts += 1;
        s.pe++;
      } else {
        if (deporte === 'padel') s.pts += 1;
        s.pp++;
      }
    });

  s.dif = s.gf - s.gc;
  return s;
}
