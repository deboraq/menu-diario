"use client";

import { useActionState, useState } from "react";
import {
  adminSetUserPasswordAction,
  adminSetUserRoleAction,
} from "@/app/actions/adminUserManagement";
import { adminCreatePasswordResetLinkAction } from "@/app/actions/passwordReset";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

function PasswordCell({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(adminSetUserPasswordAction, undefined);
  return (
    <form action={action} className="flex min-w-[140px] flex-col gap-1">
      <input type="hidden" name="userId" value={userId} />
      <input
        name="password"
        type="password"
        autoComplete="new-password"
        className="ui-input py-1.5 text-xs"
        placeholder="Nueva contraseña"
        minLength={8}
      />
      <button type="submit" disabled={pending} className="ui-btn-ghost justify-center py-1 text-xs">
        {pending ? "…" : "Guardar"}
      </button>
      {state?.error ? <p className="text-xs text-red-300">{state.error}</p> : null}
      {state?.ok ? (
        <p className="text-xs text-emerald-200/90">
          {state.notice ?? "Contraseña actualizada."}
        </p>
      ) : null}
    </form>
  );
}

function RoleCell({ userId, role }: { userId: string; role: string }) {
  const [state, action, pending] = useActionState(adminSetUserRoleAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="role"
          defaultValue={role}
          disabled={pending}
          className="ui-input max-w-[11rem] py-1.5 text-xs"
        >
          <option value="EMPLOYEE">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <button type="submit" disabled={pending} className="ui-btn-ghost py-1 text-xs">
          {pending ? "…" : "Aplicar"}
        </button>
      </div>
      {state?.error ? <p className="text-xs text-red-300">{state.error}</p> : null}
      {state?.ok ? <p className="text-xs text-emerald-200/90">Rol actualizado.</p> : null}
    </form>
  );
}

function ResetLinkButton({ userId }: { userId: string }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setMsg("");
    setBusy(true);
    try {
      const r = await adminCreatePasswordResetLinkAction(userId);
      if ("error" in r) {
        setMsg(r.error ?? "Error");
        return;
      }
      try {
        await navigator.clipboard.writeText(r.url);
        const expAt = r.expiresAt instanceof Date ? r.expiresAt : new Date(r.expiresAt);
        const exp = expAt.toLocaleString("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
        });
        setMsg(`Enlace copiado. Vence: ${exp}`);
      } catch {
        setMsg(r.url);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={onClick}
        className="ui-btn-ghost justify-center py-1.5 text-xs whitespace-nowrap"
      >
        {busy ? "…" : "Copiar enlace"}
      </button>
      {msg ? (
        <p className="max-w-[200px] break-all text-[10px] leading-snug text-[var(--muted)]">{msg}</p>
      ) : null}
    </div>
  );
}

export function AdminUsersPanel({ users }: { users: AdminUserRow[] }) {
  return (
    <section className="ui-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]/80">
              <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Nombre</th>
              <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Email</th>
              <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Rol</th>
              <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Contraseña</th>
              <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Recuperación</th>
              <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Alta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">
                  No hay usuarios.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="bg-[var(--card)]/40 align-top hover:bg-[var(--surface)]/50">
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">{u.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    <a
                      href={`mailto:${encodeURIComponent(u.email)}`}
                      className="text-[var(--accent)] underline-offset-2 hover:underline"
                    >
                      {u.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <RoleCell userId={u.id} role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <PasswordCell userId={u.id} />
                  </td>
                  <td className="px-4 py-3">
                    <ResetLinkButton userId={u.id} />
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-fg)] tabular-nums">
                    {new Date(u.createdAt).toLocaleString("es-AR", {
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
  );
}
