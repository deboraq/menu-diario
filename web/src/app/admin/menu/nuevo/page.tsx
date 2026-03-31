import Link from "next/link";
import { CreateMenuForm } from "@/components/CreateMenuForm";

export default function AdminMenuNuevoPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/menu"
          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          ← Volver a menús
        </Link>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">Nuevo menú en blanco</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Definí la fecha del menú y hasta cuándo se aceptan pedidos. Después cargá secciones y
          platos en el editor. Para copiar un menú ya armado, usá{" "}
          <Link
            href="/admin/menu/duplicar"
            className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Duplicar menú
          </Link>
          .
        </p>
      </div>

      <section className="ui-card p-6 md:p-8">
        <div className="mt-2">
          <CreateMenuForm />
        </div>
      </section>
    </div>
  );
}
