/**
 * Utilidades de fecha para partidos.
 * Las fechas se guardan como 'YYYY-MM-DD' (columna date de Postgres).
 */

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** 'YYYY-MM-DD' → 'DD/MM' (o '' si no hay fecha). */
export function fechaCorta(fecha) {
  if (!fecha) return '';
  const [, mes, dia] = fecha.split('-');
  if (!mes || !dia) return '';
  return `${dia}/${mes}`;
}

/** 'YYYY-MM-DD' → 'DD ene' (día + mes abreviado). */
export function fechaDiaMes(fecha) {
  if (!fecha) return '';
  const [, mes, dia] = fecha.split('-');
  const m = MESES[Number(mes) - 1];
  if (!m || !dia) return '';
  return `${Number(dia)} ${m}`;
}
