"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import {
  IconKey,
  IconLayout,
  IconTruck,
  IconUserPlus,
  IconUsers,
  IconUtensils,
} from "@/components/icons/ModuleIcons";

const MODULES: {
  href: string;
  label: string;
  hint: string;
  Icon: typeof IconLayout;
}[] = [
  {
    href: "/admin",
    label: "Resumen",
    hint: "Accesos rápidos",
    Icon: IconLayout,
  },
  {
    href: "/admin/menu",
    label: "Menús",
    hint: "Día y platos",
    Icon: IconUtensils,
  },
  {
    href: "/admin/invites",
    label: "Invitaciones",
    hint: "Altas por email",
    Icon: IconUserPlus,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    hint: "Roles y contraseñas",
    Icon: IconKey,
  },
  {
    href: "/admin/empleados",
    label: "Empleados",
    hint: "Cuentas y export",
    Icon: IconUsers,
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    hint: "Al proveedor",
    Icon: IconTruck,
  },
];

function moduleActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 md:hidden">
        <span className="text-sm font-semibold tracking-tight">Menú diario · Admin</span>
        <form action={logoutAction}>
          <button type="submit" className="ui-btn-ghost py-1.5 text-xs">
            Salir
          </button>
        </form>
      </div>

    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* Sidebar escritorio */}
      <aside className="hidden shrink-0 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md md:flex md:w-56 md:flex-col md:border-b-0 md:border-r">
        <div className="flex flex-col gap-1 p-4">
          <p className="ui-label px-3 pb-2">Módulos</p>
          {MODULES.map(({ href, label, hint, Icon }) => {
            const active = moduleActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  active
                    ? "bg-[var(--accent-muted)] text-[var(--accent)] ring-1 ring-[var(--accent)]/25"
                    : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className="mt-0.5 shrink-0 opacity-90" />
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-[var(--muted-fg)]">{hint}</span>
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-auto border-t border-[var(--border)] p-4">
          <form action={logoutAction}>
            <button type="submit" className="ui-btn-ghost w-full justify-center text-[var(--muted)]">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Navegación móvil: scroll horizontal */}
      <nav className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg)]/95 px-3 py-3 backdrop-blur-md md:hidden">
        {MODULES.map(({ href, label, Icon }) => {
          const active = moduleActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                active
                  ? "bg-[var(--accent-dim)] text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] ring-1 ring-[var(--border)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden border-b border-[var(--border)] px-4 py-5 md:flex md:px-8">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Panel de administración
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Gestioná menús, invitaciones y envíos al proveedor
            </p>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 md:px-8 md:pb-10">{children}</div>
      </div>
    </div>
    </div>
  );
}
