import { InviteForm } from "@/components/InviteForm";
import { listInvites } from "@/app/actions/invites";

export default async function AdminInvitesPage() {
  const invites = await listInvites();

  return (
    <div className="space-y-8">
      <div>
        <p className="ui-label">Módulo</p>
        <h2 className="text-xl font-semibold tracking-tight">Invitaciones</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Un enlace por persona. Se usa una sola vez para crear la cuenta con ese correo.
        </p>
      </div>

      <section className="ui-card p-6 md:p-8">
        <h3 className="font-semibold text-[var(--foreground)]">Nueva invitación</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ingresá el correo del empleado y copiá el enlace para enviarlo por WhatsApp o mail.
        </p>
        <div className="mt-6">
          <InviteForm />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[var(--muted)]">Últimas invitaciones</h3>
        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          {invites.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              Todavía no hay invitaciones.
            </li>
          ) : (
            invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium text-[var(--foreground)]">{inv.email}</span>
                <span className="text-[var(--muted)]">
                  {inv.usedAt
                    ? `Usada el ${inv.usedAt.toLocaleString("es-AR")}`
                    : `Vence ${inv.expiresAt.toLocaleDateString("es-AR")}`}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
