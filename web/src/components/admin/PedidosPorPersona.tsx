type Props = {
  menuDay: {
    sections: {
      id: string;
      title: string;
      items: { id: string; title: string; tag: string | null }[];
    }[];
  };
  orders: {
    id: string;
    user: { name: string; email: string };
    selections: { sectionId: string; menuItemId: string }[];
  }[];
};

export function PedidosPorPersona({ menuDay, orders }: Props) {
  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-8 text-center text-sm text-[var(--muted)]">
        Nadie cargó pedido para este día todavía.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {orders.map((order) => {
        const initial = order.user.name.trim().charAt(0).toUpperCase() || "?";
        return (
          <article key={order.id} className="ui-card overflow-hidden p-0">
            <div className="border-b border-[var(--border)] bg-[var(--surface)]/50 px-4 py-3">
              <div className="flex gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-lg font-semibold text-[var(--accent)]"
                  aria-hidden
                >
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Nombre y apellido
                  </p>
                  <p className="truncate font-semibold text-[var(--foreground)]">{order.user.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    <span className="text-[var(--muted-fg)]">Email: </span>
                    <a
                      href={`mailto:${order.user.email}`}
                      className="break-all text-[var(--accent)] underline-offset-2 hover:underline"
                    >
                      {order.user.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-[var(--border)] px-4 py-2">
              {menuDay.sections.map((section) => {
                const sel = order.selections.find((s) => s.sectionId === section.id);
                const item = section.items.find((i) => i.id === sel?.menuItemId);
                if (!item) return null;
                return (
                  <li
                    key={section.id}
                    className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <span className="text-sm font-medium text-[var(--accent)]">{section.title}</span>
                    <div className="min-w-0 flex-1 text-right sm:text-right">
                      <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                      {item.tag ? (
                        <span className="ui-pill mt-1 inline-block text-[10px]">{item.tag}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
