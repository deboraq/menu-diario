import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyOrderHistory } from "@/app/actions/orders";
import { getSession } from "@/lib/session";

export default async function MenuHistorialPage() {
  const session = await getSession();
  if (!session.user) {
    redirect("/login");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const history = await getMyOrderHistory();
  if (!history) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Mis pedidos</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Registro de lo que pediste por día (según lo guardado en el sistema).
        </p>
      </div>

      {history.length === 0 ? (
        <div className="ui-card p-8 text-center">
          <p className="text-[var(--muted)]">Todavía no tenés pedidos registrados.</p>
          <p className="mt-4">
            <Link href="/menu" className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Ir al menú de hoy
            </Link>
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {history.map((h) => {
            const dayLabel = h.menuDate.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const updated = h.updatedAt.toLocaleString("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
            });
            return (
              <li
                key={h.orderId}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold capitalize text-[var(--foreground)]">
                    {dayLabel}
                  </h2>
                  <span className="text-xs text-[var(--muted-fg)] tabular-nums">
                    Actualizado: {updated}
                  </span>
                </div>
                {h.menuTitle ? (
                  <p className="mt-1 text-sm text-[var(--accent)]">{h.menuTitle}</p>
                ) : null}
                {h.lines.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">Sin detalle de platos guardado.</p>
                ) : (
                  <ul className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
                    {h.lines.map((line, i) => (
                      <li key={`${h.orderId}-${i}`} className="text-sm">
                        <span className="font-medium text-[var(--foreground)]">{line.sectionTitle}</span>
                        <span className="text-[var(--muted)]">: </span>
                        <span className="text-[var(--foreground)]/90">{line.itemTitle}</span>
                        {line.itemDescription ? (
                          <span className="mt-0.5 block text-xs text-[var(--muted-fg)]">
                            {line.itemDescription}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-10 text-center text-xs text-[var(--muted-fg)]">
        <Link href="/menu" className="text-[var(--accent)] underline-offset-2 hover:underline">
          Volver al menú de hoy
        </Link>
      </p>
    </div>
  );
}
