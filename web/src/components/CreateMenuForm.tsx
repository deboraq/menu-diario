"use client";

import { useActionState } from "react";
import { createMenuDayAction } from "@/app/actions/menuAdmin";
import { toDateInputValue } from "@/lib/datetime";

export function CreateMenuForm() {
  const today = new Date();
  const [state, formAction, pending] = useActionState(
    createMenuDayAction,
    undefined as { error?: string } | undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[var(--foreground)]">Fecha del menú</span>
        <input
          name="menuDate"
          type="date"
          required
          defaultValue={toDateInputValue(today)}
          className="ui-input"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-[var(--foreground)]">Título (opcional)</span>
        <input
          name="title"
          type="text"
          placeholder="Menú del día"
          className="ui-input"
        />
      </label>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Desde cuándo se muestra el menú al personal
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--foreground)]">Día</span>
            <input
              name="visibleFromDate"
              type="date"
              required
              defaultValue={toDateInputValue(today)}
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
              defaultValue="00:00"
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
          <span className="text-[var(--foreground)]">Día límite para pedidos</span>
          <input
            name="deadlineDate"
            type="date"
            required
            defaultValue={toDateInputValue(today)}
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
      <p className="text-xs text-[var(--muted-fg)]">
        Entre la hora de publicación y el corte el personal puede cargar o cambiar el pedido
        para la fecha del menú.
      </p>
      {state?.error ? (
        <p className="rounded-xl border border-red-500/30 bg-[var(--danger-bg)] px-3 py-2 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="ui-btn-primary">
        {pending ? "Creando…" : "Crear y cargar platos"}
      </button>
    </form>
  );
}
