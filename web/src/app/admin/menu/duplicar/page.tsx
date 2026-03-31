import Link from "next/link";
import { DuplicateMenuForm } from "@/components/admin/DuplicateMenuForm";
import { listMenuDaysForAdmin } from "@/app/actions/orders";

type Props = { searchParams: Promise<{ from?: string }> };

export default async function AdminMenuDuplicarPage({ searchParams }: Props) {
  const { from } = await searchParams;
  const menusRaw = await listMenuDaysForAdmin();
  const menus = menusRaw.map((m) => ({
    id: m.id,
    title: m.title,
    date: m.date.toISOString(),
    visibleFromAt: m.visibleFromAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/menu"
          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          ← Volver a menús
        </Link>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">Duplicar menú</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {from ? (
            <>
              Definí la <strong className="font-medium text-[var(--foreground)]/90">fecha destino</strong>, el
              título si querés, y desde cuándo se muestra el menú hasta el corte de pedidos.
            </>
          ) : (
            <>
              Elegí en el calendario qué menú copiar y completá la fecha nueva. Para arrancar sin
              copiar, usá{" "}
              <Link
                href="/admin/menu/nuevo"
                className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Nuevo menú en blanco
              </Link>
              .
            </>
          )}
        </p>
      </div>

      {menus.length === 0 ? (
        <div className="ui-card p-8 text-center">
          <p className="text-[var(--muted)]">
            Todavía no hay menús para usar como plantilla. Creá uno en blanco primero.
          </p>
          <Link href="/admin/menu/nuevo" className="ui-btn-primary mt-4 inline-flex text-sm">
            Nuevo menú en blanco
          </Link>
        </div>
      ) : (
        <section className="ui-card p-6 md:p-8">
          <div className="mt-2">
            <DuplicateMenuForm menus={menus} presetSourceId={from} />
          </div>
        </section>
      )}
    </div>
  );
}
