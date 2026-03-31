import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { IconSparkles } from "@/components/icons/ModuleIcons";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function RecuperarTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await getSession();
  if (session.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/menu");
  }

  const { token } = await params;
  const trimmed = token?.trim() ?? "";
  const row =
    trimmed.length >= 10
      ? await prisma.passwordResetToken.findUnique({ where: { token: trimmed } })
      : null;
  const invalid =
    !row || row.usedAt != null || row.expiresAt.getTime() < Date.now();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
          <IconSparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva contraseña</h1>
      </div>

      <div className="ui-card p-6 md:p-8">
        {invalid ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-[var(--muted)]">
              Este enlace expiró o ya se usó. Pedí uno nuevo desde recuperación o a administración.
            </p>
            <Link href="/recuperar" className="ui-btn-primary inline-flex w-full justify-center text-sm">
              Pedir otro enlace
            </Link>
            <p>
              <Link
                href="/login"
                className="text-sm text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Ir al inicio de sesión
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="ui-label mb-4">Elegí una contraseña nueva (mínimo 8 caracteres)</p>
            <ResetPasswordForm token={trimmed} />
          </>
        )}
      </div>
    </main>
  );
}
