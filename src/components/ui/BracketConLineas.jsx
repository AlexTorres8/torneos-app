/**
 * BracketConLineas
 *
 * Muestra un cuadro de fase final (cuartos → semis → final)
 * con líneas SVG que conectan el ganador de cada partido
 * con el siguiente encuentro.
 *
 * Props:
 *   rondas     {Array}   Array de rondas: [{ label, partidos: [p, ...] }, ...]
 *   variant    {string}  'futsal' | 'futsal24h' | 'padel'
 *
 * Cada partido `p` debe tener la misma forma que usa MatchNode.
 */
import { useRef, useMemo } from 'react';
import { MatchNode } from './MatchNode';

// Altura de la tarjeta de partido según variante
const CARD_H = { futsal: 72, futsal24h: 120, padel: 80 };
const CARD_W = { futsal: 208, futsal24h: 260, padel: 256 };
const GAP_Y  = 24; // gap vertical entre tarjetas de la misma ronda
const GAP_X  = 48; // gap horizontal entre columnas

const ACCENT = { futsal: '#60A5FA', futsal24h: '#F59E0B', padel: '#60A5FA' };

export function BracketConLineas({ rondas = [], variant = 'futsal' }) {
  const containerRef = useRef(null);

  const cardH = CARD_H[variant] ?? 72;
  const cardW = CARD_W[variant] ?? 208;
  const accent = ACCENT[variant] ?? '#60A5FA';

  const totalCols = rondas.length;
  const svgW = totalCols * (cardW + GAP_X) - GAP_X;

  // useMemo evita el bucle infinito: antes se usaba useEffect+setState,
  // lo que disparaba un re-render en cada render (posiciones era siempre
  // una nueva referencia de array).
  const { posiciones, maxH, lines } = useMemo(() => {
    const pos = calcularPosiciones(rondas, cardH, GAP_Y);

    const mH = pos.reduce((max, col) => {
      if (!col.length) return max;
      return Math.max(max, col[col.length - 1].y + cardH);
    }, 0);

    const ls = [];
    for (let col = 0; col < pos.length - 1; col++) {
      const fromCol   = pos[col];
      const toCol     = pos[col + 1];
      const xFrom     = col * (cardW + GAP_X) + cardW;
      const xTo       = (col + 1) * (cardW + GAP_X);
      const isBracket = toCol.length * 2 <= fromCol.length;

      toCol.forEach((toPart, toIdx) => {
        const yTo = toPart.y + cardH / 2;

        if (isBracket) {
          // Bracket 2:1 — dos partidos anteriores convergen en uno
          const fromA = fromCol[toIdx * 2];
          const fromB = fromCol[toIdx * 2 + 1];
          if (!fromA || !fromB) return;

          const yFromA = fromA.y + cardH / 2;
          const yFromB = fromB.y + cardH / 2;
          const xMid   = xFrom + GAP_X / 2;

          ls.push(
            { x1: xFrom, y1: yFromA, x2: xMid, y2: yFromA, key: `hA-${col}-${toIdx}` },
            { x1: xFrom, y1: yFromB, x2: xMid, y2: yFromB, key: `hB-${col}-${toIdx}` },
            { x1: xMid,  y1: yFromA, x2: xMid, y2: yFromB, key: `v-${col}-${toIdx}`  },
            { x1: xMid,  y1: yTo,    x2: xTo,  y2: yTo,    key: `hTo-${col}-${toIdx}`},
          );
        } else {
          // Ronda clasificatoria 1:1 — línea directa al partido equivalente
          const from = fromCol[toIdx];
          if (!from) return;
          ls.push(
            { x1: xFrom, y1: from.y + cardH / 2, x2: xTo, y2: yTo, key: `h1-${col}-${toIdx}` },
          );
        }
      });
    }

    return { posiciones: pos, maxH: mH, lines: ls };
  }, [rondas, cardH, cardW]);

  return (
    <div ref={containerRef} className="relative overflow-x-auto pb-8">
      {/*
        Wrapper con width explícito = svgW.
        Etiquetas y tarjetas comparten el mismo sistema de coordenadas
        y hacen scroll juntos dentro del overflow-x-auto exterior.
      */}
      <div style={{ width: svgW }}>

        {/* Fila de etiquetas */}
        <div className="flex mb-4">
          {rondas.map((ronda, colIdx) => (
            <div
              key={ronda.label}
              className="text-center"
              style={{ width: cardW, flexShrink: 0, marginRight: colIdx < rondas.length - 1 ? GAP_X : 0 }}
            >
              <span
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  color:      colIdx === rondas.length - 1 ? accent : 'rgb(100 116 139)',
                  background: colIdx === rondas.length - 1 ? `${accent}15` : 'transparent',
                  border:     colIdx === rondas.length - 1 ? `1px solid ${accent}40` : 'none',
                }}
              >
                {ronda.label}
              </span>
            </div>
          ))}
        </div>

        {/* Área de partidos + SVG */}
        <div className="relative" style={{ height: maxH || 400 }}>

          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={svgW}
            height={maxH || 400}
            style={{ zIndex: 0 }}
          >
            {lines.map((l) => (
              <line
                key={l.key}
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={accent}
                strokeWidth={1.5}
                strokeOpacity={0.35}
              />
            ))}
          </svg>

          {rondas.map((ronda, colIdx) => (
            <div
              key={ronda.label}
              className="absolute top-0"
              style={{ left: colIdx * (cardW + GAP_X), width: cardW }}
            >
              {ronda.partidos.map((p, pIdx) => {
                const pos = posiciones[colIdx]?.[pIdx];
                if (!pos) return null;
                return (
                  <div
                    key={p?.id ?? pIdx}
                    className="absolute"
                    style={{ top: pos.y, left: 0 }}
                  >
                    <MatchNode p={p} variant={variant} />
                  </div>
                );
              })}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

/**
 * Calcula la posición Y de cada tarjeta en cada columna.
 * La primera columna se distribuye uniformemente.
 * Cada ronda siguiente se centra entre los dos partidos de origen.
 */
function calcularPosiciones(rondas, cardH, gapY) {
  const result = [];

  rondas.forEach((ronda, colIdx) => {
    const count = ronda.partidos.length;
    if (colIdx === 0) {
      // Primera columna: distribución uniforme
      result.push(
        ronda.partidos.map((_, i) => ({ y: i * (cardH + gapY) }))
      );
    } else {
      const prev     = result[colIdx - 1];
      const col      = [];
      // Bracket 2:1 (semis, final): cada partido viene de 2 anteriores.
      // Ronda clasificatoria 1:1 (previa→cuartos en pádel): alinear directamente.
      const isBracket = count * 2 <= prev.length;

      for (let i = 0; i < count; i++) {
        if (isBracket) {
          const fromA = prev[i * 2];
          const fromB = prev[i * 2 + 1];
          if (fromA && fromB) {
            col.push({ y: (fromA.y + fromB.y) / 2 });
          } else if (fromA) {
            col.push({ y: fromA.y });
          } else {
            col.push({ y: i * (cardH + gapY) });
          }
        } else {
          // 1:1: cada partido se alinea verticalmente con su equivalente anterior
          const from = prev[i];
          col.push({ y: from ? from.y : i * (cardH + gapY) });
        }
      }
      result.push(col);
    }
  });

  return result;
}
