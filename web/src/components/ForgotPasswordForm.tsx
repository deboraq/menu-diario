"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/passwordReset";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Correo</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="ui-input"
          placeholder="nombre@empresa.com"
        />
      </label>
      {state && "error" in state ? (
        <p
          className="rounded-xl border border-red-500/30 bg-[var(--danger-bg)] px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state && state.ok && state.message ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]/90">
          {state.message}
        </p>
      ) : null}
      {state && "ok" in state && state.ok && state.debugUrl ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <span className="font-medium">Solo desarrollo:</span>{" "}
          <a href={state.debugUrl} className="break-all underline underline-offset-2">
            {state.debugUrl}
          </a>
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="ui-btn-primary w-full">
        {pending ? "Enviando…" : "Pedir enlace de recuperación"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  );
}
