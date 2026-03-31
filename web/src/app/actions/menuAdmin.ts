"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { deadlineFromDateAndTime } from "@/lib/datetime";

async function requireAdmin() {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

function dayRangeFromDateInput(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return { start, end };
}

export async function createMenuDayAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const raw = {
    menuDate: formData.get("menuDate"),
    title: formData.get("title"),
    visibleFromDate: formData.get("visibleFromDate"),
    visibleFromTime: formData.get("visibleFromTime"),
    deadlineDate: formData.get("deadlineDate"),
    deadlineTime: formData.get("deadlineTime"),
  };

  const schema = z.object({
    menuDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    title: z.string().max(200).optional().or(z.literal("")),
    visibleFromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    visibleFromTime: z.string().min(1),
    deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    deadlineTime: z.string().min(1),
  });

  const parsed = schema.safeParse({
    menuDate: raw.menuDate,
    title: raw.title || "",
    visibleFromDate: raw.visibleFromDate,
    visibleFromTime: String(raw.visibleFromTime ?? ""),
    deadlineDate: raw.deadlineDate,
    deadlineTime: String(raw.deadlineTime ?? ""),
  });
  if (!parsed.success) {
    return { error: "Revisá la fecha y los horarios." };
  }

  const { start, end } = dayRangeFromDateInput(parsed.data.menuDate);
  const existing = await prisma.menuDay.findFirst({
    where: { date: { gte: start, lt: end } },
  });
  if (existing) {
    return { error: "Ya existe un menú para ese día. Editá el existente." };
  }

  const visibleFrom = deadlineFromDateAndTime(
    parsed.data.visibleFromDate,
    parsed.data.visibleFromTime
  );
  if (!visibleFrom) {
    return { error: "Fecha u hora de publicación inválida." };
  }

  const deadline = deadlineFromDateAndTime(
    parsed.data.deadlineDate,
    parsed.data.deadlineTime
  );
  if (!deadline) {
    return { error: "Fecha u hora límite inválida." };
  }

  if (visibleFrom.getTime() >= deadline.getTime()) {
    return { error: "El menú tiene que mostrarse antes del corte de pedidos." };
  }

  const title =
    parsed.data.title?.trim() || `Menú ${start.toLocaleDateString("es-AR")}`;

  const menu = await prisma.menuDay.create({
    data: {
      date: start,
      title,
      visibleFromAt: visibleFrom,
      deadlineAt: deadline,
    },
  });

  revalidatePath("/admin/menu");
  redirect(`/admin/menu/${menu.id}`);
}

const idSchema = z.string().min(1);

export async function updateMenuDayMetaAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const parsed = z
    .object({
      menuDayId: idSchema,
      title: z.string().max(200),
      visibleFromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      visibleFromTime: z.string().min(1),
      deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      deadlineTime: z.string().min(1),
    })
    .safeParse({
      menuDayId: formData.get("menuDayId"),
      title: formData.get("title"),
      visibleFromDate: formData.get("visibleFromDate"),
      visibleFromTime: formData.get("visibleFromTime"),
      deadlineDate: formData.get("deadlineDate"),
      deadlineTime: formData.get("deadlineTime"),
    });

  if (!parsed.success) {
    return { error: "Datos inválidos." };
  }

  const visibleFrom = deadlineFromDateAndTime(
    parsed.data.visibleFromDate,
    parsed.data.visibleFromTime
  );
  if (!visibleFrom) {
    return { error: "Fecha u hora de publicación inválida." };
  }

  const deadline = deadlineFromDateAndTime(
    parsed.data.deadlineDate,
    parsed.data.deadlineTime
  );
  if (!deadline) {
    return { error: "Fecha u hora límite inválida." };
  }

  if (visibleFrom.getTime() >= deadline.getTime()) {
    return { error: "El menú tiene que mostrarse antes del corte de pedidos." };
  }

  await prisma.menuDay.update({
    where: { id: parsed.data.menuDayId },
    data: {
      title: parsed.data.title.trim() || null,
      visibleFromAt: visibleFrom,
      deadlineAt: deadline,
    },
  });

  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${parsed.data.menuDayId}`);
  revalidatePath("/menu");
  return {};
}

export async function deleteMenuDayAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const menuDayId = String(formData.get("menuDayId") ?? "");
  const parsed = idSchema.safeParse(menuDayId);
  if (!parsed.success) {
    return { error: "ID inválido." };
  }

  const orders = await prisma.order.count({
    where: { menuDayId: parsed.data },
  });
  if (orders > 0) {
    return {
      error:
        "Este menú ya tiene pedidos. No se puede borrar (solo editar ítems o fecha límite).",
    };
  }

  await prisma.menuDay.delete({ where: { id: parsed.data } });
  revalidatePath("/admin/menu");
  revalidatePath("/admin/pedidos");
  revalidatePath("/menu");
  redirect("/admin/menu");
}

/** Eliminar desde la lista: no redirige; devuelve ok para refrescar en el cliente. */
export async function deleteMenuDayFromListAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const menuDayId = String(formData.get("menuDayId") ?? "");
  const parsed = idSchema.safeParse(menuDayId);
  if (!parsed.success) {
    return { error: "ID inválido." };
  }

  const orders = await prisma.order.count({
    where: { menuDayId: parsed.data },
  });
  if (orders > 0) {
    return {
      error:
        "Este menú ya tiene pedidos. No se puede borrar (solo editar ítems o fecha límite).",
    };
  }

  await prisma.menuDay.delete({ where: { id: parsed.data } });
  revalidatePath("/admin/menu");
  revalidatePath("/admin/pedidos");
  revalidatePath("/menu");
  return { ok: true };
}

export async function duplicateMenuDayAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const sourceId = String(formData.get("sourceMenuDayId") ?? "");
  const menuDate = String(formData.get("menuDate") ?? "");
  const visibleFromDate = String(formData.get("visibleFromDate") ?? "");
  const visibleFromTime = String(formData.get("visibleFromTime") ?? "");
  const deadlineDate = String(formData.get("deadlineDate") ?? "");
  const deadlineTime = String(formData.get("deadlineTime") ?? "");
  const titleRaw = String(formData.get("title") ?? "").trim();

  if (!idSchema.safeParse(sourceId).success) {
    return { error: "Origen inválido." };
  }
  const dateOk = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(menuDate);
  if (!dateOk.success) {
    return { error: "Fecha inválida." };
  }
  const deadlineDateOk = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .safeParse(deadlineDate);
  const visibleFromDateOk = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .safeParse(visibleFromDate);
  if (
    !deadlineDateOk.success ||
    !deadlineTime.trim() ||
    !visibleFromDateOk.success ||
    !visibleFromTime.trim()
  ) {
    return { error: "Completá cuándo se muestra el menú y el corte de pedidos." };
  }

  const source = await prisma.menuDay.findUnique({
    where: { id: sourceId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  if (!source) {
    return { error: "El menú origen no existe." };
  }

  const { start, end } = dayRangeFromDateInput(menuDate);
  const existing = await prisma.menuDay.findFirst({
    where: { date: { gte: start, lt: end } },
  });
  if (existing) {
    return { error: "Ya existe un menú para esa fecha. Editá el existente o elegí otra fecha." };
  }

  const visibleFromParsed = deadlineFromDateAndTime(visibleFromDate, visibleFromTime);
  if (!visibleFromParsed) {
    return { error: "Fecha u hora de publicación inválida." };
  }

  const deadline = deadlineFromDateAndTime(deadlineDate, deadlineTime);
  if (!deadline) {
    return { error: "Fecha u hora límite inválida." };
  }

  if (visibleFromParsed.getTime() >= deadline.getTime()) {
    return { error: "El menú tiene que mostrarse antes del corte de pedidos." };
  }

  const title =
    titleRaw ||
    `${source.title ?? "Menú"} ${start.toLocaleDateString("es-AR")}`;

  const menu = await prisma.menuDay.create({
    data: {
      date: start,
      title,
      visibleFromAt: visibleFromParsed,
      deadlineAt: deadline,
      sections: {
        create: source.sections.map((sec) => ({
          title: sec.title,
          sortOrder: sec.sortOrder,
          visibleToEmployee: sec.visibleToEmployee,
          items: {
            create: sec.items.map((it) => ({
              title: it.title,
              description: it.description,
              tag: it.tag,
              sortOrder: it.sortOrder,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/admin/menu");
  redirect(`/admin/menu/${menu.id}`);
}

export async function addSectionAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const menuDayId = String(formData.get("menuDayId") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  const idParsed = idSchema.safeParse(menuDayId);
  if (!idParsed.success || title.length < 1) {
    return { error: "Título de sección requerido." };
  }

  const maxSort = await prisma.menuSection.aggregate({
    where: { menuDayId: idParsed.data },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  await prisma.menuSection.create({
    data: {
      menuDayId: idParsed.data,
      title,
      sortOrder,
      visibleToEmployee: true,
    },
  });

  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${idParsed.data}`);
  revalidatePath("/menu");
  return {};
}

export async function updateSectionTitleAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const sectionId = String(formData.get("sectionId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const parsed = idSchema.safeParse(sectionId);
  if (!parsed.success || title.length < 1) {
    return { error: "Título inválido." };
  }

  const section = await prisma.menuSection.update({
    where: { id: parsed.data },
    data: { title },
    select: { menuDayId: true },
  });

  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${section.menuDayId}`);
  revalidatePath("/menu");
  return {};
}

export async function setSectionVisibilityAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const sectionId = String(formData.get("sectionId") ?? "");
  const raw = String(formData.get("visibleToEmployee") ?? "");
  const visibleToEmployee = raw === "true";

  const parsed = idSchema.safeParse(sectionId);
  if (!parsed.success) {
    return { error: "ID inválido." };
  }

  const section = await prisma.menuSection.update({
    where: { id: parsed.data },
    data: { visibleToEmployee },
    select: { menuDayId: true },
  });

  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${section.menuDayId}`);
  revalidatePath("/menu");
  return {};
}

export async function deleteSectionAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const sectionId = String(formData.get("sectionId") ?? "");
  const parsed = idSchema.safeParse(sectionId);
  if (!parsed.success) {
    return { error: "ID inválido." };
  }

  const section = await prisma.menuSection.findUnique({
    where: { id: parsed.data },
    select: { menuDayId: true },
  });
  if (!section) {
    return { error: "Sección no encontrada." };
  }

  await prisma.menuSection.delete({ where: { id: parsed.data } });
  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${section.menuDayId}`);
  revalidatePath("/menu");
  return {};
}

export async function addItemAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const sectionId = String(formData.get("sectionId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const tagRaw = String(formData.get("tag") ?? "").trim();

  const parsed = idSchema.safeParse(sectionId);
  if (!parsed.success || title.length < 1 || description.length < 1) {
    return { error: "Nombre y descripción son obligatorios." };
  }

  const maxSort = await prisma.menuItem.aggregate({
    where: { sectionId: parsed.data },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const section = await prisma.menuSection.findUnique({
    where: { id: parsed.data },
    select: { menuDayId: true },
  });
  if (!section) {
    return { error: "Sección no encontrada." };
  }

  await prisma.menuItem.create({
    data: {
      sectionId: parsed.data,
      title,
      description,
      tag: tagRaw.length ? tagRaw : null,
      sortOrder,
    },
  });

  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${section.menuDayId}`);
  revalidatePath("/menu");
  return {};
}

export async function updateItemAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const itemId = String(formData.get("itemId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const tagRaw = String(formData.get("tag") ?? "").trim();

  const parsed = idSchema.safeParse(itemId);
  if (!parsed.success || title.length < 1 || description.length < 1) {
    return { error: "Nombre y descripción son obligatorios." };
  }

  const item = await prisma.menuItem.update({
    where: { id: parsed.data },
    data: {
      title,
      description,
      tag: tagRaw.length ? tagRaw : null,
    },
    include: { section: { select: { menuDayId: true } } },
  });

  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${item.section.menuDayId}`);
  revalidatePath("/menu");
  return {};
}

export async function deleteItemAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const itemId = String(formData.get("itemId") ?? "");
  const parsed = idSchema.safeParse(itemId);
  if (!parsed.success) {
    return { error: "ID inválido." };
  }

  const item = await prisma.menuItem.findUnique({
    where: { id: parsed.data },
    include: { section: { select: { menuDayId: true } } },
  });
  if (!item) {
    return { error: "Ítem no encontrado." };
  }

  await prisma.menuItem.delete({ where: { id: parsed.data } });
  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${item.section.menuDayId}`);
  revalidatePath("/menu");
  return {};
}

export async function getMenuDayForAdminEdit(menuDayId: string) {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    return null;
  }
  const menu = await prisma.menuDay.findUnique({
    where: { id: menuDayId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  if (!menu) {
    return null;
  }
  const orderCount = await prisma.order.count({ where: { menuDayId } });
  return { menu, orderCount };
}
