"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  useEffect(() => {
    if (state && "ok" in state && state.ok && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [state, router]);

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
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Contraseña</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="ui-input"
        />
      </label>
      {state && "error" in state ? (
        <p className="rounded-xl border border-red-500/30 bg-[var(--danger-bg)] px-3 py-2 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="ui-btn-primary w-full">
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-center text-sm">
        <Link
          href="/recuperar"
          className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
      <p className="text-center text-sm text-[var(--muted)]">
        ¿Primera vez? Necesitás un{" "}
        <Link href="/registro" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          enlace de invitación
        </Link>
        .
      </p>
    </form>
  );
}
