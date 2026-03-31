/** Si no hay hora de apertura guardada, el menú se considera visible desde el inicio del día calendario del menú. */
export function effectiveVisibleFrom(menuDay: {
  date: Date;
  visibleFromAt: Date | null;
}): Date {
  if (menuDay.visibleFromAt) {
    return menuDay.visibleFromAt;
  }
  const d = new Date(menuDay.date);
  d.setHours(0, 0, 0, 0);
  return d;
}
