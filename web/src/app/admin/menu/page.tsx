import Link from "next/link";
import { listMenuDaysForAdmin } from "@/app/actions/orders";
import { MenuDayRow } from "@/components/admin/MenuDayRow";

export default async function AdminMenuListPage() {
  const days = await listMenuDaysForAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ui-label">Módulo</p>
          <h2 className="text-xl font-semibold tracking-tight">Menús del día</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
            <strong className="font-medium text-[var(--foreground)]/90">Nuevo menú</strong> arranca
            vacío. <strong className="font-medium text-[var(--foreground)]/90">Duplicar</strong> en
            cada fila copia ese menú a la fecha que elijas.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href="/admin/menu/duplicar" className="ui-btn-ghost shrink-0 text-sm">
            Duplicar menú
          </Link>
          <Link href="/admin/menu/nuevo" className="ui-btn-primary shrink-0 text-sm">
            + Nuevo menú
          </Link>
        </div>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {days.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-[var(--muted)]">
            No hay menús. Creá uno en blanco con &quot;+ Nuevo menú&quot;.
          </li>
        ) : (
          days.map((d) => (
            <MenuDayRow
              key={d.id}
              id={d.id}
              title={d.title}
              dateIso={d.date.toISOString()}
              orderCount={d._count.orders}
            />
          ))
        )}
      </ul>
    </div>
  );
}
