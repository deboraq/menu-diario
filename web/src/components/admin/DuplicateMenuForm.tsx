"use client";

import { useActionState, useState } from "react";
import { duplicateMenuDayAction } from "@/app/actions/menuAdmin";
import { dateKeyFromDbDate } from "@/lib/dateKey";
import { toDateInputValue, toTimeInputValue } from "@/lib/datetime";
import { MenuSourceCalendar } from "@/components/admin/MenuSourceCalendar";
import { effectiveVisibleFrom } from "@/lib/menuDayTimes";

type MenuOption = { id: string; title: string | null; date: string; visibleFromAt?: string | null };

type Props = { menus: MenuOption[]; presetSourceId?: string };

export function DuplicateMenuForm({ menus, presetSourceId }: Props) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [pickedSourceId, setPickedSourceId] = useState<string | null>(
    presetSourceId && menus.some((m) => m.id === presetSourceId) ? presetSourceId : null
  );

  const sourceId = presetSourceId ?? pickedSourceId;
  const sourceMenu = sourceId ? menus.find((m) => m.id === sourceId) : undefined;

  const defaultVisibleFrom = sourceMenu
    ? effectiveVisibleFrom({
        date: new Date(sourceMenu.date),
        visibleFromAt: sourceMenu.visibleFromAt ? new Date(sourceMenu.visibleFromAt) : null,
      })
    : tomorrow;

  const [state, formAction, pending] = useActionState(
    duplicateMenuDayAction,
    undefined as { error?: string } | undefined
  );

  const calendarDays = menus.map((m) => ({
    id: m.id,
    dateKey: dateKeyFromDbDate(new Date(m.date)),
  }));

  if (menus.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Primero creá al menos un menú en blanco para poder usarlo como plantilla.
      </p>
    );
  }

  const showPicker = !presetSourceId;

  return (
    <div className="flex flex-col gap-8">
      {showPicker ? (
        <MenuSourceCalendar
          days={calendarDays}
          selectedSourceId={pickedSourceId}
          onSelectSource={setPickedSourceId}
        />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-3 text-sm">
          <span className="text-[var(--muted)]">Copiando desde: </span>
          <span className="font-medium text-[var(--foreground)]">
            {sourceMenu?.title ?? "Menú"}{" "}
            <span className="font-normal text-[var(--muted)]">
              (
              {sourceMenu
                ? new Date(sourceMenu.date).toLocaleDateString("es-AR", { dateStyle: "long" })
                : ""}
              )
            </span>
          </span>
        </div>
      )}

      {sourceId ? (
        <form key={sourceId} action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="sourceMenuDayId" value={sourceId} />

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--foreground)]">Copiar a este día (fecha del menú nuevo)</span>
            <input
              name="menuDate"
              type="date"
              required
              defaultValue={toDateInputValue(tomorrow)}
              className="ui-input"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--muted)]">Título (opcional)</span>
            <input
              name="title"
              type="text"
              placeholder="Si lo dejás vacío, se arma solo"
              className="ui-input"
            />
          </label>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Cuándo se muestra el menú al personal
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-[var(--foreground)]">Día</span>
                <input
                  name="visibleFromDate"
                  type="date"
                  required
                  defaultValue={toDateInputValue(defaultVisibleFrom)}
                  className="ui-input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-[var(--foreground)]">Hora</span>
                <input
                  name="visibleFromTime"
                  type="time"
                  required
                  step={60}
                  defaultValue={toTimeInputValue(defaultVisibleFrom)}
                  className="ui-input"
                />
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Hasta cuándo se aceptan pedidos
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-[var(--foreground)]">Día límite</span>
                <input
                  name="deadlineDate"
                  type="date"
                  required
                  defaultValue={toDateInputValue(tomorrow)}
                  className="ui-input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-[var(--foreground)]">Hora límite</span>
                <input
                  name="deadlineTime"
                  type="time"
                  required
                  step={60}
                  defaultValue="23:59"
                  className="ui-input"
                />
              </label>
            </div>
          </div>

          {state?.error ? (
            <p className="text-sm text-red-300" role="alert">
              {state.error}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className="ui-btn-primary w-fit">
            {pending ? "Copiando…" : "Crear menú duplicado"}
          </button>
        </form>
      ) : showPicker ? (
        <p className="text-sm text-[var(--muted)]">Seleccioná un día con menú en el calendario.</p>
      ) : null}
    </div>
  );
}
