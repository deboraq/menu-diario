import Link from "next/link";
import { getAdminDashboardSummary } from "@/app/actions/dashboard";

export default async function AdminHomePage() {
  const dash = await getAdminDashboardSummary();

  const todayLabel = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8">
      {/* Panel del día */}
      <section className="ui-card overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--surface)]/50 px-5 py-4 md:px-6">
          <p className="ui-label">Hoy · {todayLabel}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Estado del servicio</h2>
        </div>

        <div className="space-y-6 p-5 md:p-6">
          {dash?.menuToday ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[var(--muted)]">Menú publicado</p>
                  <p className="mt-0.5 text-lg font-semibold text-[var(--foreground)]">
                    {dash.menuToday.title ?? "Menú del día"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Visible desde{" "}
                    <span className="font-medium text-[var(--foreground)]/90">
                      {dash.menuToday.visibleFromAt.toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    {" · "}
                    Corte:{" "}
                    <span className="font-medium text-[var(--accent)]">
                      {new Date(dash.menuToday.deadlineAt).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    {dash.menuToday.ordersNotOpenYet ? (
                      <span className="ml-2 rounded-md bg-[var(--accent-muted)] px-2 py-0.5 text-xs text-[var(--accent)]">
                        Aún no habilitado para pedir
                      </span>
                    ) : dash.menuToday.deadlinePassed ? (
                      <span className="ml-2 rounded-md bg-[var(--warning-bg)] px-2 py-0.5 text-xs text-amber-200">
                        Corte cerrado
                      </span>
                    ) : (
                      <span className="ml-2 rounded-md bg-[var(--success-bg)] px-2 py-0.5 text-xs text-emerald-200">
                        Acepta pedidos
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/menu/${dash.menuToday.id}`} className="ui-btn-ghost text-sm">
                    Editar menú
                  </Link>
                  <Link
                    href={`/admin/pedidos?d=${dash.menuToday.id}`}
                    className="ui-btn-primary text-sm"
                  >
                    Ver pedidos de hoy
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
                  <p className="text-xs text-[var(--muted)]">Pedidos registrados</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                    {dash.menuToday.orderCount}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
                  <p className="text-xs text-[var(--muted)]">Cuentas de empleados</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                    {dash.employeesRegistered}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-fg)]">
                    {dash.employeesRegistered > 0
                      ? `${Math.min(
                          100,
                          Math.round(
                            (dash.menuToday.orderCount / dash.employeesRegistered) * 100
                          )
                        )}% ya pidió`
                      : "Sin empleados dados de alta"}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
                  <p className="text-xs text-[var(--muted)]">Invitaciones sin usar</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                    {dash.pendingInvites}
                  </p>
                  <Link
                    href="/admin/invites"
                    className="mt-1 inline-block text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                  >
                    Gestionar →
                  </Link>
                </div>
              </div>

              {dash.recentOrders.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-[var(--muted)]">
                    Últimos pedidos de hoy
                  </p>
                  <ul className="max-h-40 overflow-y-auto rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] bg-[var(--surface)]/60">
                    {dash.recentOrders.map((o, i) => (
                      <li
                        key={`${o.email}-${i}`}
                        className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-[var(--foreground)]">{o.name}</span>
                        <span className="text-xs text-[var(--muted)]">{o.email}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Todavía no hay pedidos para el menú de hoy.
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-[var(--foreground)]">No hay menú para hoy</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Publicá un menú con fecha de hoy para que el personal pueda elegir.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/menu/nuevo" className="ui-btn-primary text-sm">
                  Crear menú de hoy
                </Link>
                <Link href="/admin/menu" className="ui-btn-ghost text-sm">
                  Ver todos los menús
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
