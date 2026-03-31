/** Valor para input type="datetime-local" en hora local. */
export function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Fecha YYYY-MM-DD para input type="date". */
export function toDateInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Hora HH:mm para input type="time" (step 60). */
export function toTimeInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Combina fecha (YYYY-MM-DD) y hora (HH:mm o HH:mm:ss) en hora local.
 */
export function deadlineFromDateAndTime(
  deadlineDate: string,
  deadlineTime: string
): Date | null {
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const t = deadlineTime.trim();
  const timeRe = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  if (!dateRe.test(deadlineDate)) return null;
  const tm = timeRe.exec(t);
  if (!tm) return null;
  const h = Number(tm[1]);
  const min = Number(tm[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  const [y, mo, d] = deadlineDate.split("-").map(Number);
  const date = new Date(y, mo - 1, d, h, min, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
