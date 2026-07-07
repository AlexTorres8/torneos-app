/**
 * Agrupación de partidos de fase de grupos en bloques de jornada,
 * separando los aplazados en bloques propios ordenados por fecha.
 *
 * Un partido se considera aplazado solo si el admin lo ha marcado
 * (columna `aplazado`). Sale en un bloque "Jornada X · Aplazada"
 * que se coloca cronológicamente entre las demás jornadas según su
 * fecha. Los partidos no marcados permanecen en su jornada aunque
 * su fecha difiera del resto.
 *
 * Fecha del bloque normal = la más repetida entre sus partidos
 * (empate → la más temprana); solo se usa como etiqueta.
 *
 * @param {Array} partidos - todos los partidos del torneo
 * @returns {Array<{ jornada:number, aplazada:boolean, fecha:string|null, partidos:Array }>}
 */
export function bloquesJornadas(partidos) {
  const grupos = partidos.filter((p) => p.fase === 'grupos');
  const jornadas = [...new Set(grupos.map((p) => p.jornada))].sort((a, b) => a - b);

  const porHora = (a, b) => (a.hora ?? '').localeCompare(b.hora ?? '');
  const bloques = [];

  for (const jornada of jornadas) {
    const delaJornada = grupos.filter((p) => p.jornada === jornada);
    const normales  = delaJornada.filter((p) => !p.aplazado);
    const aplazados = delaJornada.filter((p) => p.aplazado);

    // Fecha de la jornada (etiqueta): la más repetida entre los no aplazados
    const conteo = {};
    for (const p of normales) {
      if (p.fecha) conteo[p.fecha] = (conteo[p.fecha] || 0) + 1;
    }
    const oficial =
      Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a] || a.localeCompare(b))[0] || null;

    if (normales.length) {
      bloques.push({ jornada, aplazada: false, fecha: oficial, partidos: normales.sort(porHora) });
    }

    // Los aplazados pueden caer en fechas distintas → un bloque por fecha
    const porFecha = {};
    for (const p of aplazados) (porFecha[p.fecha || ''] ||= []).push(p);
    for (const fecha of Object.keys(porFecha).sort()) {
      bloques.push({ jornada, aplazada: true, fecha: fecha || null, partidos: porFecha[fecha].sort(porHora) });
    }
  }

  // Orden cronológico; bloques sin fecha van al final en orden de jornada
  return bloques.sort((a, b) => {
    if (a.fecha && b.fecha && a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
    if (!!a.fecha !== !!b.fecha) return a.fecha ? -1 : 1;
    return a.jornada - b.jornada || a.aplazada - b.aplazada;
  });
}
