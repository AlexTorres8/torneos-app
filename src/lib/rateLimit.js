/**
 * Rate limiter en memoria (por ventana deslizante).
 *
 * Importante: esto es defensa en profundidad en el cliente.
 * El rate limiting real contra ataques debe configurarse en
 * Supabase Dashboard → Settings → API → Rate Limiting.
 *
 * Uso:
 *   const { ok, resetIn } = checkRateLimit('guardar-resultado');
 *   if (!ok) { setError(`Demasiadas peticiones. Espera ${resetIn}s.`); return; }
 */

const ventanas = new Map();

/**
 * @param {string}  key         Identificador de la acción (p.ej. 'guardar-resultado')
 * @param {number}  maxPeticiones  Máximo de peticiones permitidas en la ventana
 * @param {number}  ventanaMs   Tamaño de la ventana en milisegundos (default: 60s)
 * @returns {{ ok: boolean, resetIn?: number }}
 */
export function checkRateLimit(key, maxPeticiones = 15, ventanaMs = 60_000) {
  const ahora = Date.now();
  const ven   = ventanas.get(key) ?? { count: 0, inicio: ahora };

  // Reinicia la ventana si ya expiró
  if (ahora - ven.inicio > ventanaMs) {
    ventanas.set(key, { count: 1, inicio: ahora });
    return { ok: true };
  }

  if (ven.count >= maxPeticiones) {
    const resetIn = Math.ceil((ven.inicio + ventanaMs - ahora) / 1000);
    return { ok: false, resetIn };
  }

  ven.count++;
  ventanas.set(key, ven);
  return { ok: true };
}
