import Link from "next/link";
import { redirect } from "next/navigation";
import { MenuForm } from "@/components/MenuForm";
import { getTodayMenu } from "@/app/actions/orders";
import { getSession } from "@/lib/session";

export default async function MenuPage() {
  const session = await getSession();
  if (!session.user) {
    redirect("/login");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const data = await getTodayMenu();
  if (!data) {
    redirect("/login");
  }

  const deadlineLabel = data.menuDay
    ? new Date(data.menuDay.deadlineAt).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";

  const visibleFromLabel =
    data.visibleFromAt != null
      ? data.visibleFromAt.toLocaleString("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "";

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 backdrop-blur-sm">
        <p className="text-sm text-[var(--muted)]">Paso a paso</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-[var(--foreground)]/90">
          <li>Elegí una opción en cada bloque del menú.</li>
          <li>Tocá confirmar antes del corte.</li>
          <li>Podés cambiar el pedido hasta esa hora.</li>
        </ol>
      </div>

      {!data.menuDay ? (
        <div className="ui-card p-8 text-center">
          <p className="text-[var(--muted)]">Todavía no hay menú cargado para hoy.</p>
          <p className="mt-2 text-sm text-[var(--muted-fg)]">
            Cuando administración publique el menú, vas a verlo acá.
          </p>
        </div>
      ) : data.ordersNotOpenYet && data.menuDay ? (
        <div className="ui-card p-8 text-center">
          <h1 className="text-lg font-semibold text-[var(--foreground)]">
            {data.menuDay.title ?? "Menú de hoy"}
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Todavía no está habilitado para pedir. Vas a poder elegir a partir del{" "}
            <span className="font-medium text-[var(--accent)]">{visibleFromLabel}</span>.
          </p>
          <p className="mt-2 text-sm text-[var(--muted-fg)]">
            Corte de pedidos: {deadlineLabel}
          </p>
        </div>
      ) : data.menuDay.sections.length === 0 ? (
        <div className="ui-card p-8 text-center">
          <h1 className="text-lg font-semibold text-[var(--foreground)]">
            {data.menuDay.title ?? "Menú de hoy"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Menú visible desde {visibleFromLabel}. Corte:{" "}
            <span className="font-medium text-[var(--accent)]">{deadlineLabel}</span>
          </p>
          <p className="mt-4 text-[var(--muted)]">
            Por ahora no hay opciones publicadas para pedir (todas las secciones están
            ocultas). Si necesitás algo, avisá a administración.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {data.menuDay.title ?? "Menú de hoy"}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Desde {visibleFromLabel} · Corte{" "}
                <span className="font-medium text-[var(--accent)]">{deadlineLabel}</span>
              </p>
            </div>
          </div>
          <MenuForm
            menuDayId={data.menuDay.id}
            sections={data.menuDay.sections}
            deadlinePassed={data.deadlinePassed}
            deadlineLabel={deadlineLabel}
            initialSelections={data.selectionMap}
          />
        </>
      )}

      <p className="mt-10 text-center text-xs text-[var(--muted-fg)]">
        <Link href="/login" className="text-[var(--accent)] underline-offset-2 hover:underline">
          Cambiar de cuenta
        </Link>
      </p>
    </div>
  );
}
