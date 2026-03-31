"use client";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale/es";
import "react-day-picker/style.css";
import { dateKeyFromDate, parseDateKeyLocal } from "@/lib/dateKey";

export type MenuSourceCalendarDay = { id: string; dateKey: string };

type Props = {
  days: MenuSourceCalendarDay[];
  selectedSourceId: string | null;
  onSelectSource: (id: string) => void;
};

export function MenuSourceCalendar({
  days,
  selectedSourceId,
  onSelectSource,
}: Props) {
  const selected = days.find((d) => d.id === selectedSourceId);
  const selectedDate = selected ? parseDateKeyLocal(selected.dateKey) : undefined;

  const hasMenuDates = useMemo(
    () => days.map((d) => parseDateKeyLocal(d.dateKey)),
    [days]
  );

  const defaultMonth = selectedDate ?? hasMenuDates[0] ?? new Date();

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const key = dateKeyFromDate(date);
    const match = days.find((d) => d.dateKey === key);
    if (match) {
      onSelectSource(match.id);
    }
  }

  return (
    <div className="menu-source-calendar-wrap">
      <p className="ui-label mb-2">Elegí el menú a copiar</p>
      <p className="mb-3 text-sm text-[var(--muted)]">
        Los días con menú aparecen marcados. Tocá uno para usarlo como plantilla.
      </p>
      <div className="flex justify-center overflow-x-auto pb-1 md:justify-start">
        <DayPicker
          mode="single"
          locale={es}
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={defaultMonth}
          numberOfMonths={2}
          modifiers={{
            hasMenu: hasMenuDates,
          }}
          modifiersClassNames={{
            hasMenu: "rdp-day_has-menu",
          }}
          className="pedidos-calendar menu-source-calendar"
        />
      </div>
    </div>
  );
}
