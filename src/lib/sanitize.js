// Límites de longitud por tipo de campo
const MAX = { nombre: 60, equipo: 40, detalle: 30 };

/**
 * Limpia el nombre de un torneo.
 * React ya escapa HTML al renderizar, pero limitamos la longitud
 * y eliminamos caracteres de control para evitar basura en la BD.
 */
export function sanitizarNombre(str) {
  if (typeof str !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return str.trim().slice(0, MAX.nombre).replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Limpia el nombre de un equipo/pareja.
 */
export function sanitizarEquipo(str) {
  if (typeof str !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return str.trim().slice(0, MAX.equipo).replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Valida y limpia el detalle de sets de pádel.
 * Solo permite: dígitos, espacios, comas y guiones (formato "6-4, 4-6, 7-6").
 */
export function sanitizarDetalle(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, MAX.detalle).replace(/[^0-9 ,-]/g, '');
}
