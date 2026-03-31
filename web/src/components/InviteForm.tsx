"use client";

import { useActionState, useState } from "react";
import { createInviteAction } from "@/app/actions/invites";

export function InviteForm() {
  const [state, formAction, pending] = useActionState(createInviteAction, undefined);
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    if (!state?.url) return;
    const full =
      state.url.startsWith("http") ? state.url : `${window.location.origin}${state.url}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
          <span className="text-[var(--foreground)]">Correo del empleado</span>
          <input
            name="email"
            type="email"
            required
            className="ui-input"
            placeholder="nombre@empresa.com"
          />
        </label>
        <label className="flex w-28 flex-col gap-2 text-sm">
          <span className="text-[var(--muted)]">Válida (días)</span>
          <input
            name="daysValid"
            type="number"
            min={1}
            max={365}
            defaultValue={14}
            className="ui-input"
          />
        </label>
        <button type="submit" disabled={pending} className="ui-btn-primary shrink-0">
          {pending ? "Creando…" : "Crear invitación"}
        </button>
      </form>
      {state?.error ? (
        <p className="text-sm text-red-300">{state.error}</p>
      ) : null}
      {state?.url ? (
        <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-muted)]/40 p-4 text-sm">
          <p className="font-medium text-[var(--accent)]">Enviá este enlace al empleado</p>
          <p className="mt-2 break-all rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 font-mono text-xs text-[var(--muted)]">
            {state.url.startsWith("http")
              ? state.url
              : `${typeof window !== "undefined" ? window.location.origin : ""}${state.url}`}
          </p>
          <button
            type="button"
            onClick={copyUrl}
            className="mt-3 ui-btn-ghost text-[var(--accent)]"
          >
            {copied ? "Copiado" : "Copiar enlace"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
