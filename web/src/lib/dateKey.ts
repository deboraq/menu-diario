/** Fecha local YYYY-MM-DD (para calendario y coincidencias). */
export function dateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKeyLocal(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dateKeyFromDbDate(d: Date): string {
  return dateKeyFromDate(new Date(d));
}
