import Link from "next/link";
import { ExportPanel } from "@/components/ExportPanel";
import { PedidosCalendar } from "@/components/admin/PedidosCalendar";
import { PedidosPorPersona } from "@/components/admin/PedidosPorPersona";
import {
  exportTextForCaterer,
  getAggregatedOrdersForDay,
  listMenuDaysForAdmin,
} from "@/app/actions/orders";
import { dateKeyFromDbDate } from "@/lib/dateKey";
import { effectiveVisibleFrom } from "@/lib/menuDayTimes";

type Props = { searchParams: Promise<{ d?: string }> };

export default async function AdminPedidosPage({ searchParams }: Props) {
  const days = await listMenuDaysForAdmin();
  const { d } = await searchParams;
  const selectedId = d && days.some((x) => x.id === d) ? d : days[0]?.id;

  if (!selectedId) {
    return (
      <div className="ui-card p-8 text-center">
        <p className="text-[var(--muted)]">
          No hay días de menú. Creá uno en{" "}
          <Link href="/admin/menu" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Menús
          </Link>
          .
        </p>
      </div>
    );
  }

  const data = await getAggregatedOrdersForDay(selectedId);
  const plainText = await exportTextForCaterer(selectedId);
  if (!data) {
    return <p className="text-[var(--muted)]">Menú no encontrado.</p>;
  }

  const selectedDay = days.find((x) => x.id === selectedId);

  const calendarDays = days.map((d) => ({
    id: d.id,
    dateKey: dateKeyFromDbDate(d.date),
    orderCount: d._count.orders,
  }));

  const visibleFromAdmin = effectiveVisibleFrom({
    date: data.menuDay.date,
    visibleFromAt: data.menuDay.visibleFromAt,
  });

  const supplierSummary = {
    title: data.menuDay.title ?? "Menú",
    dateLabel: data.menuDay.date.toLocaleDateString("es-AR", { dateStyle: "long" }),
    sections: data.menuDay.sections
      .map((section) => ({
        title: section.title,
        items: section.items
          .map((item) => ({
            qty: data.counts[item.id]?.count ?? 0,
            title: item.title,
            description: item.description,
            tag: item.tag,
          }))
          .filter((i) => i.qty > 0),
      }))
      .filter((s) => s.items.length > 0),
    people: data.orders.map((o) => ({
      name: o.user.name,
      email: o.user.email,
      choices: data.menuDay.sections
        .map((s) => {
          const sel = o.selections.find((x) => x.sectionId === s.id);
          const item = s.items.find((i) => i.id === sel?.menuItemId);
          return item
            ? { sectionTitle: s.title, itemTitle: item.title }
            : null;
        })
        .filter((x): x is { sectionTitle: string; itemTitle: string } => x !== null),
    })),
  };

  return (
    <div className="space-y-10">
      <div>
        <p className="ui-label">Módulo</p>
        <h2 className="text-xl font-semibold tracking-tight">Pedidos al proveedor</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Tocá una fecha en el calendario para ver la carta del día, totales y pedidos. Exportá
          a Excel abajo.
        </p>
      </div>

      <section className="ui-card w-full p-5 md:p-6">
        <p className="ui-label mb-2">Calendario</p>
        <h3 className="text-base font-semibold text-[var(--foreground)]">Días con menú</h3>
        <div className="mt-4 flex w-full justify-center overflow-x-auto">
          <PedidosCalendar
            key={selectedId}
            days={calendarDays}
            selectedId={selectedId}
            numberOfMonths={2}
          />
        </div>
        <p className="mt-4 text-xs text-[var(--muted-fg)]">
          Los días con menú cargado tienen borde violeta. Al elegir una fecha se actualiza
          esta página con la carta y los pedidos.
        </p>
      </section>

      {selectedDay ? (
        <p className="text-sm text-[var(--muted-fg)]">
          {selectedDay._count.orders} pedido{selectedDay._count.orders === 1 ? "" : "s"} en esta
          fecha.
        </p>
      ) : null}

      {/* Carta del día */}
      <section className="ui-card p-6 md:p-8">
        <p className="ui-label mb-2">Carta del día seleccionado</p>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          {data.menuDay.title ?? "Menú"}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Visible desde{" "}
          <span className="font-medium text-[var(--accent)]">
            {visibleFromAdmin.toLocaleString("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
          {" · "}
          Corte de pedidos{" "}
          <span className="font-medium text-[var(--accent)]">
            {data.menuDay.deadlineAt.toLocaleString("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
        </p>
        <div className="mt-6 space-y-6">
          {data.menuDay.sections.map((section) => (
            <div key={section.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-4">
              <h4 className="font-semibold text-[var(--accent)]">{section.title}</h4>
              <ul className="mt-3 space-y-3">
                {section.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    <span className="font-medium text-[var(--foreground)]">{item.title}</span>
                    {item.tag ? (
                      <span className="ml-2 text-xs text-[var(--muted)]">({item.tag})</span>
                    ) : null}
                    <p className="mt-0.5 text-[var(--muted-fg)] leading-relaxed">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Totales por plato */}
      <section className="ui-card p-6 md:p-8">
        <div className="mb-6 border-b border-[var(--border)] pb-4">
          <h3 className="text-lg font-semibold">Totales por plato</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Cantidades pedidas para el proveedor (solo ítems con al menos un pedido).
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.menuDay.sections.map((section) => {
            const itemsWithCount = section.items
              .map((item) => ({
                item,
                c: data.counts[item.id]?.count ?? 0,
              }))
              .filter((x) => x.c > 0);
            if (itemsWithCount.length === 0) return null;
            return (
              <div
                key={section.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4"
              >
                <h4 className="border-b border-[var(--border)] pb-2 font-semibold text-[var(--accent)]">
                  {section.title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {itemsWithCount.map(({ item, c }) => (
                    <li key={item.id} className="flex items-start justify-between gap-2 text-sm">
                      <span className="min-w-0 text-[var(--foreground)]">
                        <span className="font-semibold tabular-nums text-[var(--accent)]">{c}×</span>{" "}
                        {item.title}
                        {item.tag ? (
                          <span className="ml-1 text-xs text-[var(--muted)]">({item.tag})</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Por persona */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Pedido por persona</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Nombre completo, correo y lo que eligió en cada bloque.
          </p>
        </div>
        <PedidosPorPersona
          menuDay={data.menuDay}
          orders={data.orders.map((o) => ({
            id: o.id,
            user: o.user,
            selections: o.selections,
          }))}
        />
      </section>

      <section className="ui-card p-6 md:p-8">
        <ExportPanel
          plainText={plainText}
          menuDayId={selectedId}
          summary={supplierSummary}
          subject={`Pedido menú ${data.menuDay.title ?? "empresa"} — ${data.menuDay.date.toLocaleDateString("es-AR")}`}
          catererEmail={process.env.NEXT_PUBLIC_CATERER_EMAIL}
        />
      </section>
    </div>
  );
}
