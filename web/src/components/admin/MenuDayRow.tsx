"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteMenuDayFromListAction } from "@/app/actions/menuAdmin";

type Props = {
  id: string;
  title: string | null;
  dateIso: string;
  orderCount: number;
};

export function MenuDayRow({ id, title, dateIso, orderCount }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deleteMenuDayFromListAction,
    undefined as { error?: string; ok?: boolean } | undefined
  );

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state?.ok, router]);

  const canDelete = orderCount === 0;
  const dateLabel = new Date(dateIso).toLocaleDateString("es-AR", { dateStyle: "long" });

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--foreground)]">
          {title ?? "Sin título"}{" "}
          <span className="font-normal text-[var(--muted)]">({dateLabel})</span>
        </p>
        <p className="mt-0.5 text-xs text-[var(--muted-fg)]">
          {orderCount === 0
            ? "Sin pedidos — se puede eliminar"
            : `${orderCount} pedido${orderCount === 1 ? "" : "s"} — no se puede eliminar`}
        </p>
        {state?.error ? (
          <p className="mt-2 text-sm text-red-300" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Link
          href={`/admin/menu/duplicar?from=${id}`}
          className="ui-btn-ghost text-sm"
          title="Elegir fecha y copiar este menú"
        >
          Duplicar
        </Link>
        <Link href={`/admin/menu/${id}`} className="ui-btn-primary text-sm">
          Editar
        </Link>
        {canDelete ? (
          <form action={formAction}>
            <input type="hidden" name="menuDayId" value={id} />
            <button
              type="submit"
              disabled={pending}
              className="ui-btn-danger-ghost text-sm"
              onClick={(e) => {
                if (!confirm("¿Eliminar este menú? No hay pedidos asociados.")) {
                  e.preventDefault();
                }
              }}
            >
              {pending ? "…" : "Eliminar"}
            </button>
          </form>
        ) : (
          <span className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
            Eliminar no disponible
          </span>
        )}
      </div>
    </li>
  );
}
