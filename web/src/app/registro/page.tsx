import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { IconSparkles } from "@/components/icons/ModuleIcons";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Props = { searchParams: Promise<{ token?: string }> };

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--accent)]">
      {children}
    </code>
  );
}

export default async function RegistroPage({ searchParams }: Props) {
  const session = await getSession();
  if (session.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/menu");
  }

  const { token } = await searchParams;
  if (!token) {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="ui-card p-6 md:p-8">
          <h1 className="text-xl font-semibold">Falta el enlace</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Abrí el enlace completo que te envió administración (incluye <Code>?token=…</Code>
            ).
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </main>
    );
  }

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="ui-card p-6 md:p-8">
          <h1 className="text-xl font-semibold">Invitación inválida</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Este enlace no existe o fue reemplazado. Pedí uno nuevo a administración.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </main>
    );
  }
  if (invite.usedAt) {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="ui-card p-6 md:p-8">
          <h1 className="text-xl font-semibold">Invitación ya usada</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Esta invitación ya se utilizó. Iniciá sesión con tu correo y contraseña.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }
  if (invite.expiresAt < new Date()) {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="ui-card p-6 md:p-8">
          <h1 className="text-xl font-semibold">Invitación vencida</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Pedí un enlace nuevo a administración.</p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
          <IconSparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Completá tus datos. El correo lo fija la invitación.
        </p>
      </div>
      <div className="ui-card p-6 md:p-8">
        <p className="ui-label mb-4">Registro</p>
        <RegisterForm token={token} inviteEmail={invite.email} />
      </div>
    </main>
  );
}
