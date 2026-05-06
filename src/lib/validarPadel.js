/**
 * Valida que un resultado de pádel sea coherente.
 * Recibe: setsLocal (0-2), setsVisitante (0-2), detalle (ej: "6-4, 4-6, 7-6")
 * Devuelve: { ok: true } | { ok: false, error: string }
 */
export function validarResultadoPadel(setsLocal, setsVisitante, detalle) {
  const l = parseInt(setsLocal);
  const v = parseInt(setsVisitante);

  // 1. Sets deben ser números válidos
  if (isNaN(l) || isNaN(v)) return { ok: false, error: 'Introduce los sets ganados por cada equipo.' };

  // 2. Solo combinaciones posibles: 2-0, 2-1, 0-2, 1-2
  const combinacionesValidas = ['2-0', '2-1', '0-2', '1-2'];
  if (!combinacionesValidas.includes(`${l}-${v}`)) {
    return { ok: false, error: `Resultado ${l}-${v} imposible en pádel. Solo puede ser 2-0, 2-1, 0-2 o 1-2.` };
  }

  // 3. Parsear el detalle de sets
  if (!detalle || !detalle.trim()) return { ok: false, error: 'Introduce el detalle de sets (ej: 6-4, 4-6, 7-6).' };

  const sets = detalle.split(',').map((s) => {
    const partes = s.trim().split(/[-/]+/);
    return { a: parseInt(partes[0]), b: parseInt(partes[1]) };
  });

  // 4. El número de sets en el detalle debe coincidir con l+v
  const totalSets = l + v;
  if (sets.length !== totalSets) {
    return {
      ok: false,
      error: `El marcador ${l}-${v} implica ${totalSets} set${totalSets > 1 ? 's' : ''}, pero has introducido ${sets.length}.`,
    };
  }

  // 5. Cada set debe tener valores numéricos
  for (let i = 0; i < sets.length; i++) {
    const s = sets[i];
    if (isNaN(s.a) || isNaN(s.b)) {
      return { ok: false, error: `El set ${i + 1} tiene valores inválidos. Formato: 6-4, 4-6, 7-6` };
    }
  }

  // 6. Verificar que el ganador de cada set coincide con el recuento final
  let ganaLocal = 0;
  let ganaVisitante = 0;
  sets.forEach((s) => {
    if (s.a > s.b) ganaLocal++;
    else if (s.b > s.a) ganaVisitante++;
    // empate dentro de un set no puede darse en pádel, pero no bloqueamos
  });

  if (ganaLocal !== l || ganaVisitante !== v) {
    return {
      ok: false,
      error: `El detalle de sets indica ${ganaLocal}-${ganaVisitante} pero el marcador dice ${l}-${v}. Revísalo.`,
    };
  }

  return { ok: true };
}
