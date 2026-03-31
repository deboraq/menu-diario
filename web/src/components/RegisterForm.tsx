"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

type Props = { token: string; inviteEmail: string };

export function RegisterForm({ token, inviteEmail }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  useEffect(() => {
    if (state && "ok" in state && state.ok && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Nombre</span>
          <input
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            className="ui-input"
            placeholder="Nombre"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Apellido</span>
          <input
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            className="ui-input"
            placeholder="Apellido"
          />
        </label>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--muted)]">
        Cuenta para:{" "}
        <strong className="break-all text-[var(--foreground)]">{inviteEmail}</strong>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Contraseña</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="ui-input"
        />
      </label>
      {state && "error" in state ? (
        <p className="rounded-xl border border-red-500/30 bg-[var(--danger-bg)] px-3 py-2 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="ui-btn-primary w-full">
        {pending ? "Creando cuenta…" : "Crear cuenta y entrar"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
