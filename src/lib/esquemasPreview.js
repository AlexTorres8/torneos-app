/**
 * Esquemas de previsualización del cuadro de fase final.
 *
 * Cuando un torneo aún no tiene partidos reales de una fase eliminatoria,
 * los cuadros públicos muestran un esquema "previsualizado" (hora, pista,
 * etiquetas 1º Grupo A, etc.). Estos son los valores por defecto.
 *
 * El admin puede personalizarlos por torneo desde la pestaña "Cuadro":
 * se guardan en torneos.esquema_preview (jsonb) con la forma
 *   { cuartos: [{ hora, ubicacion, fecha, local, visitante }, …], semis: […], … }
 * y tienen prioridad sobre los defaults. NULL = usar defaults.
 */

// Fila de partido placeholder (formato plano, editable en admin).
const f = (hora, ubicacion, local, visitante) => ({ hora, ubicacion, fecha: null, local, visitante });

// ── PÁDEL ────────────────────────────────────────────────────────────────────
export const DEF_PADEL = {
  playoffs: [
    f('20:30', 'Pista 1', '2º Grupo A', '3º Grupo C'),
    f('20:30', 'Pista 2', '2º Grupo B', '3º Grupo D'),
    f('22:00', 'Pista 1', '2º Grupo C', '3º Grupo A'),
    f('22:00', 'Pista 2', '2º Grupo D', '3º Grupo B'),
  ],
  cuartos: [
    f('20:00', 'Pista 1', '1º Grupo A', 'G. Playoff 1'),
    f('20:00', 'Pista 2', '1º Grupo C', 'G. Playoff 2'),
    f('22:00', 'Pista 1', '1º Grupo B', 'G. Playoff 3'),
    f('22:00', 'Pista 2', '1º Grupo D', 'G. Playoff 4'),
  ],
  // PLATA (sin ronda previa): cuartos directos con 1º y 2º de cada grupo.
  cuartosPlata: [
    f('20:00', 'Pista 1', '1º Grupo A', '2º Grupo B'),
    f('20:00', 'Pista 2', '1º Grupo C', '2º Grupo D'),
    f('21:30', 'Pista 1', '1º Grupo B', '2º Grupo A'),
    f('21:30', 'Pista 2', '1º Grupo D', '2º Grupo C'),
  ],
  semis: [
    f('20:30', 'Pista 1', 'Ganador C1', 'Ganador C2'),
    f('22:00', 'Pista 2', 'Ganador C3', 'Ganador C4'),
  ],
  // PLATA: semi 1 a las 20:00 (Pista 1) y semi 2 a las 21:30 (Pista 2).
  semisPlata: [
    f('20:00', 'Pista 1', 'Ganador C1', 'Ganador C2'),
    f('21:30', 'Pista 2', 'Ganador C3', 'Ganador C4'),
  ],
  // ORO: ronda previa de 2 partidos, semifinales y gran final (sin cuartos).
  previaOro: [
    f('19:30', 'Pista 1', '2º Grupo A', '3º Grupo B'),
    f('19:30', 'Pista 2', '2º Grupo B', '3º Grupo A'),
  ],
  semisOro: [
    f('21:00', 'Pista 1', '1º Grupo A', 'G. Previa 1'),
    f('21:00', 'Pista 2', '1º Grupo B', 'G. Previa 2'),
  ],
  // Oro reducido (≤6 parejas): sin ronda previa, semifinales directas y final.
  semisOroCruce: [ // 2 grupos: cruce 1º-2º
    f('21:30', 'Pista 1', '1º Grupo A', '2º Grupo B'),
    f('21:30', 'Pista 2', '1º Grupo B', '2º Grupo A'),
  ],
  semisOroUnico: [ // grupo único: 1º-4º y 2º-3º
    f('21:30', 'Pista 1', '1º Grupo A', '4º Grupo A'),
    f('21:30', 'Pista 2', '2º Grupo A', '3º Grupo A'),
  ],
  final: [f('Por conf.', 'Pista 1', 'Ganador Semi 1', 'Ganador Semi 2')],
};

// ── FUTSAL ───────────────────────────────────────────────────────────────────
export const DEF_FUTSAL = {
  cuartos: [
    f('21:00', 'Pista Ext.', '1º Grupo A', '4º Grupo B'),
    f('21:00', 'Pabellón',   '2º Grupo B', '3º Grupo A'),
    f('22:00', 'Pabellón',   '1º Grupo B', '4º Grupo A'),
    f('22:00', 'Pista Ext.', '2º Grupo A', '3º Grupo B'),
  ],
  semis: [
    f('21:00', 'Pabellón', 'Ganador C1', 'Ganador C2'),
    f('22:00', 'Pabellón', 'Ganador C3', 'Ganador C4'),
  ],
  final: [f('21:00', 'Pabellón', 'Ganador Semi 1', 'Ganador Semi 2')],
};

// ── FUTSAL 24H ───────────────────────────────────────────────────────────────
export const DEF_24H = {
  cuartos: [
    f('Por conf.', 'Pabellón', '1º Grupo A', 'Mejor 3º'),
    f('Por conf.', 'Pista',    '2º Grupo C', '2º Grupo B'),
    f('Por conf.', 'Pabellón', '1º Grupo B', '2º Mejor 3º'),
    f('Por conf.', 'Pista',    '1º Grupo C', '2º Grupo A'),
  ],
  semis: [
    f('Por conf.', 'Pabellón', 'Ganador C1', 'Ganador C2'),
    f('Por conf.', 'Pabellón', 'Ganador C3', 'Ganador C4'),
  ],
  final: [f('Por conf.', 'Pabellón', 'Ganador Semi 1', 'Ganador Semi 2')],
};

/** Orden canónico de las fases eliminatorias en el cuadro. */
export const ORDEN_FASES = ['playoffs', 'cuartos', 'semis', 'final'];

/** Etiqueta visible de una fase según el deporte/formato del torneo. */
export function labelFase(torneo, key) {
  switch (key) {
    case 'playoffs': return 'Ronda Previa';
    case 'cuartos':  return torneo?.deporte === 'padel' || torneo?.formato === '24h' ? 'Cuartos' : 'Cuartos de Final';
    case 'semis':    return 'Semifinales';
    case 'final':    return 'Gran Final';
    default:         return key;
  }
}

/** Convierte filas planas al formato que espera MatchNode/BracketConLineas. */
function aPlaceholder(key, filas) {
  return (filas ?? []).map((p, i) => ({
    id: `esq-${key}-${i}`,
    hora: p.hora || '',
    ubicacion: p.ubicacion || '',
    fecha: p.fecha || null,
    estado: 'pendiente',
    local: { nombre: p.local || '¿?' },
    visitante: { nombre: p.visitante || '¿?' },
  }));
}

/**
 * Construye las rondas del cuadro de fase final.
 *
 * Prioridad por fase (en orden canónico playoffs → cuartos → semis → final):
 *   1. Partidos reales de la fase → siempre se muestran.
 *   2. Si el torneo tiene esquema_preview → este define la estructura completa:
 *      las fases presentes se previsualizan, las ausentes se ocultan.
 *   3. Sin personalización → estructura por defecto (fasesDefecto).
 *
 * @param {object} torneo               fila de torneos (con esquema_preview)
 * @param {object} reales               { playoffs, cuartos, semis, final } arrays de partidos reales
 * @param {Array}  fasesDefecto         resultado de fasesPorDefecto()
 * @returns {Array<{ label, partidos }>}
 */
export function construirRondas(torneo, reales, fasesDefecto) {
  const esq = torneo?.esquema_preview;
  const defPorKey = Object.fromEntries((fasesDefecto ?? []).map((f) => [f.key, f]));

  return ORDEN_FASES.flatMap((key) => {
    const realesFase = reales[key] ?? [];
    if (realesFase.length > 0) {
      return [{ label: defPorKey[key]?.label ?? labelFase(torneo, key), partidos: realesFase }];
    }
    if (esq && typeof esq === 'object') {
      const filas = esq[key];
      return Array.isArray(filas) && filas.length > 0
        ? [{ label: labelFase(torneo, key), partidos: aPlaceholder(key, filas) }]
        : [];
    }
    const def = defPorKey[key];
    return def ? [{ label: def.label, partidos: aPlaceholder(key, def.partidos) }] : [];
  });
}

/**
 * Filas por defecto para sembrar una fase recién añadida en el editor.
 * Para fases sin default en su deporte (p. ej. playoffs en futsal),
 * devuelve filas vacías.
 */
export function filasPorDefectoFase(torneo, key) {
  const clon  = (filas) => filas.map((p) => ({ ...p }));
  const vacia = () => ({ hora: '', ubicacion: '', fecha: null, local: '', visitante: '' });

  if (torneo?.deporte === 'padel') {
    const esPlata = torneo.categoria === 'plata';
    if (key === 'playoffs') return clon(torneo.categoria === 'oro' ? DEF_PADEL.previaOro : DEF_PADEL.playoffs);
    if (key === 'cuartos')  return clon(esPlata ? DEF_PADEL.cuartosPlata : DEF_PADEL.cuartos);
    if (key === 'semis')    return clon(esPlata ? DEF_PADEL.semisPlata : DEF_PADEL.semis);
    return clon(DEF_PADEL.final);
  }

  const def = torneo?.formato === '24h' ? DEF_24H : DEF_FUTSAL;
  if (key === 'playoffs') return [vacia(), vacia()];
  return clon(def[key] ?? [vacia()]);
}

/**
 * Estructura de fases por defecto de un torneo, para sembrar el editor admin.
 * Refleja la misma lógica que usan los cuadros públicos.
 *
 * @param {{deporte, categoria, formato}} torneo
 * @param {{nGrupos?: number, totalParejas?: number}} ctx
 * @returns {Array<{ key: string, label: string, partidos: Array }>}
 */
export function fasesPorDefecto(torneo, { nGrupos = 0, totalParejas = 0 } = {}) {
  const clon = (filas) => filas.map((p) => ({ ...p }));

  if (torneo?.deporte === 'padel') {
    const esOro   = torneo.categoria === 'oro';
    const esPlata = torneo.categoria === 'plata';
    const oroReducido = esOro && nGrupos > 0 && totalParejas <= 6;

    if (oroReducido) return [
      { key: 'semis', label: 'Semifinales', partidos: clon(nGrupos === 1 ? DEF_PADEL.semisOroUnico : DEF_PADEL.semisOroCruce) },
      { key: 'final', label: 'Gran Final',  partidos: clon(DEF_PADEL.final) },
    ];
    if (esOro) return [
      { key: 'playoffs', label: 'Ronda Previa', partidos: clon(DEF_PADEL.previaOro) },
      { key: 'semis',    label: 'Semifinales',  partidos: clon(DEF_PADEL.semisOro) },
      { key: 'final',    label: 'Gran Final',   partidos: clon(DEF_PADEL.final) },
    ];
    if (esPlata) return [
      { key: 'cuartos', label: 'Cuartos',     partidos: clon(DEF_PADEL.cuartosPlata) },
      { key: 'semis',   label: 'Semifinales', partidos: clon(DEF_PADEL.semisPlata) },
      { key: 'final',   label: 'Gran Final',  partidos: clon(DEF_PADEL.final) },
    ];
    return [
      { key: 'playoffs', label: 'Ronda Previa', partidos: clon(DEF_PADEL.playoffs) },
      { key: 'cuartos',  label: 'Cuartos',      partidos: clon(DEF_PADEL.cuartos) },
      { key: 'semis',    label: 'Semifinales',  partidos: clon(DEF_PADEL.semis) },
      { key: 'final',    label: 'Gran Final',   partidos: clon(DEF_PADEL.final) },
    ];
  }

  const def = torneo?.formato === '24h' ? DEF_24H : DEF_FUTSAL;
  return [
    { key: 'cuartos', label: torneo?.formato === '24h' ? 'Cuartos' : 'Cuartos de Final', partidos: clon(def.cuartos) },
    { key: 'semis',   label: 'Semifinales', partidos: clon(def.semis) },
    { key: 'final',   label: 'Gran Final',  partidos: clon(def.final) },
  ];
}
