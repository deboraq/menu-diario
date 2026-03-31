"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isConfig =
    error.message?.includes("SESSION_SECRET") ||
    error.message?.includes("DATABASE_URL") ||
    error.message?.includes("DIRECT_URL");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
      <div className="ui-card p-8 text-center">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Algo salió mal</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {isConfig ? (
            <>
              Parece un problema de configuración: revisá el archivo{" "}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">web/.env</code>{" "}
              (SESSION_SECRET de 32+ caracteres, DATABASE_URL y DIRECT_URL hacia Postgres/Supabase, y
              si usás{" "}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">npm start</code> en
              localhost:{" "}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">
                SESSION_INSECURE_LOCAL=1
              </code>
              ). Si cambió el esquema:{" "}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">
                npx prisma migrate dev
              </code>{" "}
              (local) o{" "}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">
                npx prisma migrate deploy
              </code>
              .
            </>
          ) : (
            error.message || "Error inesperado."
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="ui-btn-primary text-sm">
            Reintentar
          </button>
          <Link href="/login" className="ui-btn-ghost text-sm">
            Ir al login
          </Link>
        </div>
      </div>
    </main>
  );
}
