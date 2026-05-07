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
import { useRef, useEffect, useState } from 'react';
import { MatchNode } from './MatchNode';

// Altura de la tarjeta de partido según variante
const CARD_H = { futsal: 72, futsal24h: 80, padel: 80 };
const CARD_W = { futsal: 208, futsal24h: 260, padel: 256 };
const GAP_Y  = 24; // gap vertical entre tarjetas de la misma ronda
const GAP_X  = 48; // gap horizontal entre columnas

const ACCENT = { futsal: '#60A5FA', futsal24h: '#F59E0B', padel: '#60A5FA' };

export function BracketConLineas({ rondas = [], variant = 'futsal' }) {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

  const cardH = CARD_H[variant] ?? 72;
  const cardW = CARD_W[variant] ?? 208;
  const accent = ACCENT[variant] ?? '#60A5FA';

  // Calcular las posiciones Y de cada tarjeta en cada ronda
  // Las tarjetas de una ronda se centran verticalmente respecto a
  // los dos partidos de la ronda anterior que les dan origen.
  const posiciones = calcularPosiciones(rondas, cardH, GAP_Y);

  // SVG total dimensions
  const totalCols  = rondas.length;
  const svgW = totalCols * (cardW + GAP_X) - GAP_X;
  const maxH = posiciones.reduce((max, col) => {
    if (!col.length) return max;
    const ultimo = col[col.length - 1];
    return Math.max(max, ultimo.y + cardH);
  }, 0);

  // Dibujar líneas entre rondas
  useEffect(() => {
    const newLines = [];
    for (let col = 0; col < posiciones.length - 1; col++) {
      const fromCol = posiciones[col];
      const toCol   = posiciones[col + 1];
      const xFrom = col * (cardW + GAP_X) + cardW;
      const xTo   = (col + 1) * (cardW + GAP_X);

      // Cada partido de la ronda siguiente recibe dos ganadores de la anterior (pares)
      toCol.forEach((toPart, toIdx) => {
        const fromA = fromCol[toIdx * 2];
        const fromB = fromCol[toIdx * 2 + 1];
        if (!fromA || !fromB) return;

        const yFromA = fromA.y + cardH / 2;
        const yFromB = fromB.y + cardH / 2;
        const yTo    = toPart.y + cardH / 2;
        const xMid   = xFrom + GAP_X / 2;

        // Dos líneas horizontales desde cada partido + línea vertical que las une + línea horizontal a la siguiente tarjeta
        newLines.push(
          // Horizontal derecha de A
          { x1: xFrom, y1: yFromA, x2: xMid, y2: yFromA, key: `hA-${col}-${toIdx}` },
          // Horizontal derecha de B
          { x1: xFrom, y1: yFromB, x2: xMid, y2: yFromB, key: `hB-${col}-${toIdx}` },
          // Vertical uniendo A y B
          { x1: xMid, y1: yFromA, x2: xMid, y2: yFromB, key: `v-${col}-${toIdx}` },
          // Horizontal desde el centro vertical hasta la tarjeta siguiente
          { x1: xMid, y1: yTo, x2: xTo, y2: yTo, key: `hTo-${col}-${toIdx}` },
        );
      });
    }
    setLines(newLines);
  }, [posiciones, cardH, cardW]);

  return (
    <div ref={containerRef} className="relative overflow-x-auto pb-8" style={{ minWidth: svgW }}>

      {/* SVG de fondo con las líneas */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={svgW}
        height={maxH}
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

      {/* Columnas de tarjetas */}
      <div
        className="relative flex gap-0"
        style={{ zIndex: 1, width: svgW, height: maxH || 400 }}
      >
        {rondas.map((ronda, colIdx) => (
          <div
            key={ronda.label}
            style={{ width: cardW, marginRight: colIdx < rondas.length - 1 ? GAP_X : 0 }}
          >
            {/* Etiqueta de ronda */}
            <div
              className="text-center mb-4"
              style={{ height: 24, lineHeight: '24px' }}
            >
              <span
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  color: colIdx === rondas.length - 1 ? accent : 'rgb(100 116 139)',
                  background: colIdx === rondas.length - 1 ? `${accent}15` : 'transparent',
                  border: colIdx === rondas.length - 1 ? `1px solid ${accent}40` : 'none',
                }}
              >
                {ronda.label}
              </span>
            </div>

            {/* Tarjetas de partido, posicionadas absolutas según cálculo */}
            <div className="relative" style={{ height: maxH - 24 }}>
              {ronda.partidos.map((p, pIdx) => {
                const pos = posiciones[colIdx]?.[pIdx];
                if (!pos) return null;
                return (
                  <div
                    key={p?.id ?? pIdx}
                    className="absolute"
                    style={{ top: pos.y - 24, left: 0 }} // -24 por el espacio de la etiqueta
                  >
                    <MatchNode p={p} variant={variant} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
      const prev = result[colIdx - 1];
      const col  = [];
      for (let i = 0; i < count; i++) {
        const fromA = prev[i * 2];
        const fromB = prev[i * 2 + 1];
        if (fromA && fromB) {
          // Centro entre los dos partidos de la ronda anterior
          col.push({ y: (fromA.y + fromB.y) / 2 });
        } else if (fromA) {
          col.push({ y: fromA.y });
        } else {
          col.push({ y: i * (cardH + gapY) });
        }
      }
      result.push(col);
    }
  });

  return result;
}
