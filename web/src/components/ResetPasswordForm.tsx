"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordWithTokenAction } from "@/app/actions/passwordReset";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordWithTokenAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Nueva contraseña</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="ui-input"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Repetir contraseña</span>
        <input
          name="password2"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="ui-input"
        />
      </label>
      {state?.error ? (
        <p
          className="rounded-xl border border-red-500/30 bg-[var(--danger-bg)] px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          Contraseña actualizada. Podés{" "}
          <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            iniciar sesión
          </Link>
          .
        </p>
      ) : null}
      <button type="submit" disabled={pending || state?.ok} className="ui-btn-primary w-full">
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
