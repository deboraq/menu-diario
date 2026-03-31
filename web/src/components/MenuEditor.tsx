"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addItemAction,
  addSectionAction,
  deleteItemAction,
  deleteMenuDayAction,
  deleteSectionAction,
  setSectionVisibilityAction,
  updateItemAction,
  updateMenuDayMetaAction,
  updateSectionTitleAction,
} from "@/app/actions/menuAdmin";
import { toDateInputValue, toTimeInputValue } from "@/lib/datetime";
import { effectiveVisibleFrom } from "@/lib/menuDayTimes";

type Item = {
  id: string;
  title: string;
  description: string;
  tag: string | null;
};

type Section = {
  id: string;
  title: string;
  visibleToEmployee?: boolean;
  items: Item[];
};

type Menu = {
  id: string;
  title: string | null;
  date: string;
  visibleFromAt: string | null;
  deadlineAt: string;
  sections: Section[];
};

type Props = { menu: Menu; orderCount: number };

export function MenuEditor({ menu, orderCount }: Props) {
  const router = useRouter();
  const addSectionRef = useRef<HTMLInputElement>(null);

  const [metaState, metaAction, metaPending] = useActionState(
    updateMenuDayMetaAction,
    undefined as { error?: string } | undefined
  );

  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteMenuDayAction,
    undefined as { error?: string } | undefined
  );

  async function refreshAfter(
    action: (formData: FormData) => Promise<{ error?: string } | void>,
    formData: FormData
  ): Promise<void> {
    const r = await action(formData);
    if (r && typeof r === "object" && "error" in r && r.error) {
      alert(r.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link
          href="/admin/menu"
          className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          ← Volver a menús
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/menu/duplicar?from=${menu.id}`}
            className="ui-btn-ghost text-xs"
          >
            Duplicar a otra fecha
          </Link>
          <span className="text-[var(--muted)]">
            Día:{" "}
            <strong className="text-[var(--foreground)]">
              {new Date(menu.date).toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </strong>
          </span>
        </div>
      </div>

      <section className="ui-card p-5 md:p-6">
        <p className="ui-label mb-1">Módulo: datos del día</p>
        <h2 className="text-lg font-semibold">Título y corte</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Configurá cuándo el personal ve el menú y hasta cuándo puede pedir.
        </p>
        <form action={metaAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="menuDayId" value={menu.id} />
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--foreground)]">Título</span>
            <input
              name="title"
              type="text"
              defaultValue={menu.title ?? ""}
              className="ui-input"
              placeholder="Menú del día"
            />
          </label>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Desde cuándo se muestra el menú al personal
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-[var(--foreground)]">Día</span>
                <input
                  name="visibleFromDate"
                  type="date"
                  required
                  defaultValue={toDateInputValue(
                    effectiveVisibleFrom({
                      date: new Date(menu.date),
                      visibleFromAt: menu.visibleFromAt ? new Date(menu.visibleFromAt) : null,
                    })
                  )}
                  className="ui-input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-[var(--foreground)]">Hora</span>
                <input
                  name="visibleFromTime"
                  type="time"
                  required
                  step={60}
                  defaultValue={toTimeInputValue(
                    effectiveVisibleFrom({
                      date: new Date(menu.date),
                      visibleFromAt: menu.visibleFromAt ? new Date(menu.visibleFromAt) : null,
                    })
                  )}
                  className="ui-input"
                />
              </label>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Hasta cuándo se aceptan pedidos
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-[var(--foreground)]">Día límite</span>
                <input
                  name="deadlineDate"
                  type="date"
                  required
                  defaultValue={toDateInputValue(new Date(menu.deadlineAt))}
                  className="ui-input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-[var(--foreground)]">Hora límite</span>
                <input
                  name="deadlineTime"
                  type="time"
                  required
                  step={60}
                  defaultValue={toTimeInputValue(new Date(menu.deadlineAt))}
                  className="ui-input"
                />
              </label>
            </div>
          </div>
          {metaState?.error ? (
            <p className="text-sm text-red-300">{metaState.error}</p>
          ) : null}
          <button type="submit" disabled={metaPending} className="ui-btn-primary w-fit">
            {metaPending ? "Guardando…" : "Guardar datos"}
          </button>
        </form>
      </section>

      {orderCount === 0 ? (
        <section className="rounded-2xl border border-red-500/25 bg-[var(--danger-bg)] p-5">
          <h2 className="text-lg font-semibold text-red-200">Eliminar menú</h2>
          <p className="mt-1 text-sm text-red-200/85">
            Solo podés borrar un menú si nadie hizo pedidos todavía.
          </p>
          <form action={deleteAction} className="mt-3">
            <input type="hidden" name="menuDayId" value={menu.id} />
            {deleteState?.error ? (
              <p className="mb-2 text-sm text-red-300">{deleteState.error}</p>
            ) : null}
            <button type="submit" disabled={deletePending} className="ui-btn-danger-ghost">
              {deletePending ? "Borrando…" : "Eliminar este menú"}
            </button>
          </form>
        </section>
      ) : (
        <p className="rounded-xl border border-amber-500/25 bg-[var(--warning-bg)] px-4 py-3 text-sm text-amber-100/95">
          Hay <strong>{orderCount}</strong> pedido{orderCount === 1 ? "" : "s"} para este
          día. No se puede borrar el menú; solo editarlo.
        </p>
      )}

      <section className="space-y-4">
        <div>
          <p className="ui-label">Módulo: carta</p>
          <h2 className="text-lg font-semibold">Secciones y platos</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Cada sección es un bloque (ej. tartas, ensaladas). Podés ocultar una sección al
            personal (solo la ves vos en pedidos / totales).
          </p>
        </div>

        {menu.sections.map((section) => {
          const visible = section.visibleToEmployee !== false;
          return (
          <div key={section.id} className="ui-card p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <form
                action={(fd) => refreshAfter(updateSectionTitleAction, fd)}
                className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end"
              >
                <input type="hidden" name="sectionId" value={section.id} />
                <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
                  <span className="font-medium text-[var(--accent)]">Título de la sección</span>
                  <input
                    name="title"
                    defaultValue={section.title}
                    className="ui-input text-base"
                  />
                </label>
                <button type="submit" className="ui-btn-ghost shrink-0">
                  Guardar título
                </button>
              </form>
              <div className="flex flex-wrap items-center gap-2">
                <form action={(fd) => refreshAfter(setSectionVisibilityAction, fd)}>
                  <input type="hidden" name="sectionId" value={section.id} />
                  <input
                    type="hidden"
                    name="visibleToEmployee"
                    value={visible ? "false" : "true"}
                  />
                  <button type="submit" className="ui-btn-ghost text-xs">
                    {visible ? "Ocultar a empleados" : "Mostrar a empleados"}
                  </button>
                </form>
                <form
                  action={(fd) => {
                    if (
                      !confirm(
                        "¿Borrar esta sección y todos sus platos? Esta acción no se puede deshacer."
                      )
                    ) {
                      return;
                    }
                    void refreshAfter(deleteSectionAction, fd);
                  }}
                >
                  <input type="hidden" name="sectionId" value={section.id} />
                  <button type="submit" className="text-sm text-red-300 underline-offset-2 hover:underline">
                    Quitar sección
                  </button>
                </form>
              </div>
            </div>
            {!visible ? (
              <p className="mt-2 rounded-lg border border-amber-500/25 bg-[var(--warning-bg)] px-3 py-2 text-xs text-amber-100/95">
                Esta sección no la ve el personal al pedir; sigue contando en tus totales si
                la activás de nuevo con pedidos previos.
              </p>
            ) : null}

            <ul className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
              {section.items.map((item) => (
                <li key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-3">
                  <form action={(fd) => refreshAfter(updateItemAction, fd)} className="flex flex-col gap-2">
                    <input type="hidden" name="itemId" value={item.id} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
                        <span>Nombre corto</span>
                        <input
                          name="title"
                          defaultValue={item.title}
                          className="ui-input text-sm"
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
                        <span>Etiqueta (opcional)</span>
                        <input
                          name="tag"
                          defaultValue={item.tag ?? ""}
                          placeholder="KETO, Vegetariano…"
                          className="ui-input text-sm"
                        />
                      </label>
                    </div>
                    <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
                      <span>Descripción / ingredientes</span>
                      <textarea
                        name="description"
                        defaultValue={item.description}
                        rows={3}
                        required
                        className="ui-input min-h-[72px] resize-y text-sm"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" className="ui-btn-primary text-xs">
                        Guardar plato
                      </button>
                      <button
                        type="button"
                        className="ui-btn-danger-ghost text-xs"
                        onClick={() => {
                          if (!confirm("¿Quitar este plato de la lista?")) return;
                          const fd = new FormData();
                          fd.set("itemId", item.id);
                          void refreshAfter(deleteItemAction, fd);
                        }}
                      >
                        Quitar plato
                      </button>
                    </div>
                  </form>
                </li>
              ))}
            </ul>

            <form
              action={(fd) => {
                void refreshAfter(addItemAction, fd);
              }}
              className="mt-4 flex flex-col gap-2 border-t border-dashed border-[var(--border)] pt-4"
            >
              <input type="hidden" name="sectionId" value={section.id} />
              <p className="text-sm font-medium text-[var(--muted)]">Agregar plato en esta sección</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  name="title"
                  required
                  placeholder="Nombre (ej. Opción 1)"
                  className="ui-input text-sm"
                />
                <input
                  name="tag"
                  placeholder="Etiqueta opcional"
                  className="ui-input text-sm"
                />
              </div>
              <textarea
                name="description"
                required
                placeholder="Descripción completa"
                rows={2}
                className="ui-input min-h-[56px] resize-y text-sm"
              />
              <button type="submit" className="ui-btn-ghost w-fit border-[var(--accent)]/35 text-[var(--accent)]">
                + Agregar plato
              </button>
            </form>
          </div>
          );
        })}

        <form
          action={(fd) =>
            refreshAfter(addSectionAction, fd).then(() => {
              addSectionRef.current?.focus();
            })
          }
          className="rounded-2xl border-2 border-dashed border-[var(--accent)]/35 bg-[var(--accent-muted)]/30 p-4"
        >
          <input type="hidden" name="menuDayId" value={menu.id} />
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--foreground)]">Nueva sección</span>
            <div className="flex flex-wrap gap-2">
              <input
                ref={addSectionRef}
                name="title"
                required
                placeholder="Ej. ENSALADAS, TARTAS…"
                className="min-w-[200px] flex-1 ui-input"
              />
              <button type="submit" className="ui-btn-primary">
                Agregar sección
              </button>
            </div>
          </label>
        </form>
      </section>
    </div>
  );
}
