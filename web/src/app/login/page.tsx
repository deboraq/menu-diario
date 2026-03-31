import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { IconSparkles } from "@/components/icons/ModuleIcons";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();
  if (session.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/menu");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
          <IconSparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Menú diario</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Ingresá con la cuenta que creaste con tu invitación.
        </p>
      </div>

      <div className="ui-card p-6 md:p-8">
        <p className="ui-label mb-4">Inicio de sesión</p>
        <LoginForm />
      </div>

      <p className="mt-8 text-center text-xs text-[var(--muted-fg)]">
        <Link href="/" className="text-[var(--accent)] underline-offset-2 hover:underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  );
}
