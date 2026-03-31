import { listEmployeesForAdmin } from "@/app/actions/adminEmployees";

export default async function AdminEmpleadosPage() {
  const employees = await listEmployeesForAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ui-label">Módulo</p>
          <h2 className="text-xl font-semibold tracking-tight">Empleados registrados</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Personas que se dieron de alta con invitación (rol empleado). Exportá la lista a
            Excel cuando la necesites.
          </p>
        </div>
        <a href="/api/admin/export/empleados" className="ui-btn-primary text-sm">
          Descargar Excel (.xlsx)
        </a>
      </div>

      <section className="ui-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]/80">
                <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Nombre</th>
                <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Email</th>
                <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-[var(--muted)]">
                    Todavía no hay empleados dados de alta.
                  </td>
                </tr>
              ) : (
                employees.map((u) => (
                  <tr key={u.id} className="bg-[var(--card)]/40 hover:bg-[var(--surface)]/50">
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{u.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      <a
                        href={`mailto:${encodeURIComponent(u.email)}`}
                        className="text-[var(--accent)] underline-offset-2 hover:underline"
                      >
                        {u.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-fg)] tabular-nums">
                      {u.createdAt.toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
