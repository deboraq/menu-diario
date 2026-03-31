"use client";

import { useState } from "react";

export type SupplierSummary = {
  title: string;
  dateLabel: string;
  sections: {
    title: string;
    items: { qty: number; title: string; description: string; tag: string | null }[];
  }[];
  people: {
    name: string;
    email: string;
    choices: { sectionTitle: string; itemTitle: string }[];
  }[];
};

type Props = {
  plainText: string;
  subject: string;
  catererEmail?: string | null;
  menuDayId: string;
  summary: SupplierSummary;
};

export function ExportPanel({
  plainText,
  subject,
  catererEmail,
  menuDayId,
  summary,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copyPlain() {
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mailtoHref =
    catererEmail && catererEmail.includes("@")
      ? `mailto:${encodeURIComponent(catererEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`
      : null;

  const excelHref = `/api/admin/export/pedidos?menuDayId=${encodeURIComponent(menuDayId)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ui-label">Envío al proveedor</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            Resumen y exportación
          </h3>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
            Misma información que arriba, lista para compartir. Descargá Excel para
            planillas o copiá el texto plano para WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={excelHref} className="ui-btn-primary text-sm">
            Descargar Excel (.xlsx)
          </a>
          <button type="button" onClick={copyPlain} className="ui-btn-ghost text-sm">
            {copied ? "Copiado" : "Copiar texto plano"}
          </button>
          {mailtoHref ? (
            <a href={mailtoHref} className="ui-btn-ghost text-sm text-[var(--accent)]">
              Abrir en el correo
            </a>
          ) : null}
        </div>
      </div>

      {!mailtoHref ? (
        <p className="text-xs text-[var(--muted-fg)]">
          Para armar el mail en un clic, agregá{" "}
          <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[var(--muted)]">
            NEXT_PUBLIC_CATERER_EMAIL
          </code>{" "}
          en <code className="rounded bg-[var(--surface)] px-1.5 py-0.5">.env</code>.
        </p>
      ) : null}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/80 p-5 md:p-6">
        <header className="border-b border-[var(--border)] pb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Pedido
          </p>
          <h4 className="mt-1 text-base font-semibold text-[var(--foreground)]">
            {summary.title}
          </h4>
          <p className="mt-1 text-sm text-[var(--muted)]">Fecha: {summary.dateLabel}</p>
        </header>

        <div className="mt-6 space-y-8">
          <div>
            <p className="text-sm font-semibold text-[var(--accent)]">Cantidades por plato</p>
            <div className="mt-3 space-y-5">
              {summary.sections.map((sec) => (
                <div key={sec.title} className="rounded-xl border border-[var(--border)] bg-[var(--card)]/90 p-4">
                  <h5 className="text-sm font-semibold text-[var(--foreground)]">{sec.title}</h5>
                  <ul className="mt-2 space-y-2 text-sm">
                    {sec.items.map((it, idx) => (
                      <li
                        key={`${sec.title}-${idx}-${it.title}`}
                        className="flex flex-wrap gap-x-2 gap-y-1 border-b border-[var(--border)]/60 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="font-semibold tabular-nums text-[var(--accent)]">
                          {it.qty}×
                        </span>
                        <span className="font-medium text-[var(--foreground)]">{it.title}</span>
                        {it.tag ? (
                          <span className="text-xs text-[var(--muted)]">({it.tag})</span>
                        ) : null}
                        <span className="w-full text-[var(--muted-fg)]">{it.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--accent)]">Detalle por persona</p>
            <ul className="mt-3 space-y-3">
              {summary.people.length === 0 ? (
                <li className="text-sm text-[var(--muted)]">Sin pedidos para este día.</li>
              ) : (
                summary.people.map((p) => (
                  <li
                    key={p.email}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)]/90 p-4"
                  >
                    <p className="font-medium text-[var(--foreground)]">{p.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{p.email}</p>
                    <ul className="mt-2 space-y-1 text-sm text-[var(--foreground)]/90">
                      {p.choices.map((c) => (
                        <li key={`${p.email}-${c.sectionTitle}`}>
                          <span className="text-[var(--muted)]">{c.sectionTitle}:</span>{" "}
                          {c.itemTitle}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--muted)] marker:text-[var(--accent)]">
          Ver solo texto plano (para pegar en otro lado)
        </summary>
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-[var(--input-bg)] p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[var(--foreground)]/85">
          {plainText}
        </pre>
      </details>
    </div>
  );
}
