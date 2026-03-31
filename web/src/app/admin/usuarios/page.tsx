import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import { listAllUsersForAdmin } from "@/app/actions/adminUserManagement";

export default async function AdminUsuariosPage() {
  const rows = await listAllUsersForAdmin();
  const users = rows.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="ui-label">Módulo</p>
        <h2 className="text-xl font-semibold tracking-tight">Usuarios y accesos</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cambiá roles, asigná contraseña nueva o generá un enlace de recuperación para pasarle al
          usuario (no hay envío automático de correo).
        </p>
      </div>

      <AdminUsersPanel users={users} />
    </div>
  );
}
