"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export function EmployeeShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const menuActive = pathname === "/menu";
  const historialActive = pathname.startsWith("/menu/historial");

  const tabClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition ${
      active
        ? "bg-[var(--accent-dim)] text-white"
        : "bg-[var(--surface)] text-[var(--muted)] ring-1 ring-[var(--border)] hover:text-[var(--foreground)]"
    }`;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M3 2v7c0 1.1 2 2 5 2s5-.9 5-2V2" />
                  <path d="M8 2v20" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Menú diario</p>
                <p className="font-medium leading-tight text-[var(--foreground)]">{userName}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="ui-btn-ghost text-xs">
                Salir
              </button>
            </form>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Secciones empleado">
            <Link href="/menu" className={tabClass(menuActive)}>
              Menú de hoy
            </Link>
            <Link href="/menu/historial" className={tabClass(historialActive)}>
              Mis pedidos
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
