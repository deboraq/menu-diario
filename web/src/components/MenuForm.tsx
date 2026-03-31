"use client";

import { useActionState, useMemo } from "react";
import { submitOrderAction } from "@/app/actions/orders";

type Section = {
  id: string;
  title: string;
  items: {
    id: string;
    title: string;
    description: string;
    tag: string | null;
  }[];
};

type Props = {
  menuDayId: string;
  sections: Section[];
  deadlinePassed: boolean;
  deadlineLabel: string;
  initialSelections: Record<string, string>;
};

export function MenuForm({
  menuDayId,
  sections,
  deadlinePassed,
  deadlineLabel,
  initialSelections,
}: Props) {
  const [state, formAction, pending] = useActionState(submitOrderAction, undefined);

  const defaultChecked = useMemo(() => {
    const map: Record<string, string> = { ...initialSelections };
    return map;
  }, [initialSelections]);

  if (deadlinePassed) {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-[var(--warning-bg)] px-4 py-4 text-sm text-amber-100/95">
        El pedido para hoy cerró a las <strong>{deadlineLabel}</strong>. Ya no se puede
        modificar.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="menuDayId" value={menuDayId} />
      {state?.error ? (
        <p
          className="rounded-xl border border-red-500/30 bg-[var(--danger-bg)] px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-xl border border-emerald-500/25 bg-[var(--success-bg)] px-3 py-2 text-sm text-emerald-200">
          Pedido guardado. Podés cambiarlo hasta el corte.
        </p>
      ) : null}

      {sections.map((section) => (
        <section key={section.id} className="ui-card p-4 md:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {section.title}
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {section.items.map((item) => {
              const name = `section:${section.id}`;
              const id = `${section.id}-${item.id}`;
              const isDefault = defaultChecked[section.id] === item.id;
              return (
                <li key={item.id}>
                  <label
                    htmlFor={id}
                    className="flex cursor-pointer gap-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)]/50 p-3 transition hover:border-[var(--accent)]/35 hover:bg-[var(--surface)] [&:has(input:checked)]:border-[var(--accent-dim)] [&:has(input:checked)]:ring-1 [&:has(input:checked)]:ring-[var(--accent)]/30"
                  >
                    <input
                      id={id}
                      type="radio"
                      name={name}
                      value={item.id}
                      required
                      defaultChecked={isDefault}
                      className="mt-1.5 size-4 shrink-0 accent-[var(--accent-dim)]"
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-medium text-[var(--foreground)]">
                        {item.title}
                        {item.tag ? <span className="ui-pill ml-2 align-middle">{item.tag}</span> : null}
                      </span>
                      <span className="mt-1 block text-[var(--muted)] leading-relaxed">
                        {item.description}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="ui-card px-4 py-4 text-center text-sm text-[var(--muted)]">
        ¡Que lo disfrutes!
      </div>

      <button type="submit" disabled={pending} className="ui-btn-primary w-full">
        {pending ? "Guardando…" : "Confirmar pedido del día"}
      </button>
    </form>
  );
}
