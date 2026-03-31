"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale/es";
import "react-day-picker/style.css";
import { dateKeyFromDate, parseDateKeyLocal } from "@/lib/dateKey";

export type PedidosCalendarDay = {
  id: string;
  dateKey: string;
  orderCount: number;
};

type Props = {
  days: PedidosCalendarDay[];
  selectedId: string;
  numberOfMonths?: number;
};

export function PedidosCalendar({ days, selectedId, numberOfMonths = 2 }: Props) {
  const router = useRouter();

  const selected = days.find((d) => d.id === selectedId);
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
      router.push(`/admin/pedidos?d=${match.id}`);
    }
  }

  return (
    <div className="pedidos-calendar-wrap">
      <DayPicker
        mode="single"
        locale={es}
        selected={selectedDate}
        onSelect={handleSelect}
        defaultMonth={defaultMonth}
        numberOfMonths={numberOfMonths}
        modifiers={{
          hasMenu: hasMenuDates,
        }}
        modifiersClassNames={{
          hasMenu: "rdp-day_has-menu",
        }}
        className="pedidos-calendar pedidos-calendar-wide"
      />
      <p className="mt-3 text-xs text-[var(--muted-fg)]">
        Los días con menú cargado se marcan con un borde violeta. Tocá un día para ver
        pedidos de esa fecha.
      </p>
    </div>
  );
}
