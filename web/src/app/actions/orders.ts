"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { effectiveVisibleFrom } from "@/lib/menuDayTimes";

function dayRange(d: Date) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function getTodayMenu() {
  const session = await getSession();
  if (!session.user) return null;
  const { start, end } = dayRange(new Date());
  const menuDay = await prisma.menuDay.findFirst({
    where: {
      date: { gte: start, lt: end },
    },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  if (!menuDay) {
    return {
      closed: false as const,
      menuDay: null,
      deadlinePassed: false,
      ordersNotOpenYet: false,
      visibleFromAt: null as Date | null,
    };
  }

  const now = new Date();
  const visibleFrom = effectiveVisibleFrom(menuDay);
  const ordersNotOpenYet = now < visibleFrom;
  const deadlinePassed = now > menuDay.deadlineAt;

  const sectionsForEmployee = menuDay.sections.filter((s) => s.visibleToEmployee);
  const menuDayForEmployee = { ...menuDay, sections: sectionsForEmployee };

  const order = await prisma.order.findUnique({
    where: {
      userId_menuDayId: { userId: session.user.userId, menuDayId: menuDay.id },
    },
    include: {
      selections: true,
    },
  });
  const selectionMap = new Map(
    order?.selections.map((s) => [s.sectionId, s.menuItemId]) ?? []
  );
  return {
    closed: false as const,
    menuDay: menuDayForEmployee,
    deadlinePassed,
    ordersNotOpenYet,
    visibleFromAt: visibleFrom,
    selectionMap: Object.fromEntries(selectionMap),
  };
}

const submitSchema = z.object({
  menuDayId: z.string().min(1),
  selections: z.record(z.string(), z.string()),
});

export async function submitOrderAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  const session = await getSession();
  if (!session.user) {
    return { error: "Tenés que iniciar sesión." };
  }
  const menuDayId = String(formData.get("menuDayId") ?? "");
  const selections: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("section:")) {
      const sectionId = key.slice("section:".length);
      selections[sectionId] = String(value);
    }
  }
  const parsed = submitSchema.safeParse({ menuDayId, selections });
  if (!parsed.success) {
    return { error: "Datos incompletos." };
  }
  const menuDay = await prisma.menuDay.findUnique({
    where: { id: parsed.data.menuDayId },
    include: {
      sections: { include: { items: true } },
    },
  });
  if (!menuDay) {
    return { error: "Menú no encontrado." };
  }
  const now = new Date();
  if (now < effectiveVisibleFrom(menuDay)) {
    return { error: "Todavía no está habilitado el pedido para este menú." };
  }
  if (now > menuDay.deadlineAt) {
    return { error: "Ya pasó el horario límite para pedir hoy." };
  }
  const visibleSections = menuDay.sections.filter((s) => s.visibleToEmployee);
  if (visibleSections.length === 0) {
    return { error: "No hay secciones visibles para pedir. Avisá a administración." };
  }
  for (const section of visibleSections) {
    if (!parsed.data.selections[section.id]) {
      return { error: "Tenés que elegir una opción en cada sección." };
    }
  }
  const itemBySection = new Map<string, string>();
  for (const section of visibleSections) {
    const itemId = parsed.data.selections[section.id];
    const valid = section.items.some((i) => i.id === itemId);
    if (!valid) {
      return { error: "Selección inválida." };
    }
    itemBySection.set(section.id, itemId);
  }
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.upsert({
      where: {
        userId_menuDayId: {
          userId: session.user!.userId,
          menuDayId: menuDay.id,
        },
      },
      create: {
        userId: session.user!.userId,
        menuDayId: menuDay.id,
      },
      update: {},
    });
    await tx.orderSelection.deleteMany({ where: { orderId: order.id } });
    await tx.orderSelection.createMany({
      data: [...itemBySection.entries()].map(([sectionId, menuItemId]) => ({
        orderId: order.id,
        sectionId,
        menuItemId,
      })),
    });
  });
  return { ok: true };
}

export async function getAggregatedOrdersForDay(menuDayId: string) {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  const menuDay = await prisma.menuDay.findUnique({
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
  if (!menuDay) return null;
  const orders = await prisma.order.findMany({
    where: { menuDayId },
    include: {
      user: { select: { name: true, email: true } },
      selections: true,
    },
  });
  const counts: Record<
    string,
    { title: string; description: string; count: number; tag: string | null }
  > = {};
  for (const section of menuDay.sections) {
    for (const item of section.items) {
      counts[item.id] = {
        title: item.title,
        description: item.description,
        count: 0,
        tag: item.tag,
      };
    }
  }
  for (const order of orders) {
    for (const sel of order.selections) {
      if (counts[sel.menuItemId]) {
        counts[sel.menuItemId].count += 1;
      }
    }
  }
  return { menuDay, orders, counts };
}

export async function listMenuDaysForAdmin() {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return prisma.menuDay.findMany({
    orderBy: { date: "desc" },
    take: 60,
    include: {
      _count: { select: { orders: true } },
    },
  });
}

export async function exportTextForCaterer(menuDayId: string) {
  const data = await getAggregatedOrdersForDay(menuDayId);
  if (!data) return "";
  const lines: string[] = [];
  const vf = effectiveVisibleFrom({
    date: data.menuDay.date,
    visibleFromAt: data.menuDay.visibleFromAt,
  });
  lines.push(`Pedido — ${data.menuDay.title ?? "Menú"}`);
  lines.push(`Fecha: ${data.menuDay.date.toLocaleDateString("es-AR")}`);
  lines.push(
    `Menú visible desde: ${vf.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}`
  );
  lines.push(
    `Corte de pedidos: ${data.menuDay.deadlineAt.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}`
  );
  lines.push("");
  for (const section of data.menuDay.sections) {
    lines.push(`## ${section.title}`);
    for (const item of section.items) {
      const c = data.counts[item.id]?.count ?? 0;
      if (c > 0) {
        lines.push(`- ${c}× ${item.title}: ${item.description}`);
      }
    }
    lines.push("");
  }
  lines.push("--- Detalle por persona ---");
  for (const o of data.orders) {
    lines.push(`Nombre y apellido: ${o.user.name}`);
    lines.push(`Email: ${o.user.email}`);
    for (const s of data.menuDay.sections) {
      const sel = o.selections.find((x) => x.sectionId === s.id);
      const item = s.items.find((i) => i.id === sel?.menuItemId);
      if (item) {
        lines.push(`  • ${s.title}: ${item.title}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

export type MyOrderHistoryEntry = {
  orderId: string;
  menuDayId: string;
  menuDate: Date;
  menuTitle: string | null;
  createdAt: Date;
  updatedAt: Date;
  lines: { sectionTitle: string; itemTitle: string; itemDescription: string }[];
};

/** Pedidos del usuario actual con platos elegidos por día (empleado). */
export async function getMyOrderHistory(): Promise<MyOrderHistoryEntry[] | null> {
  const session = await getSession();
  if (!session.user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.userId },
    orderBy: [{ menuDay: { date: "desc" } }, { createdAt: "desc" }],
    include: {
      menuDay: {
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      selections: true,
    },
  });

  const itemById = new Map<string, { title: string; description: string }>();
  const sectionById = new Map<string, { title: string }>();
  for (const o of orders) {
    for (const s of o.menuDay.sections) {
      sectionById.set(s.id, { title: s.title });
      for (const it of s.items) {
        itemById.set(it.id, { title: it.title, description: it.description });
      }
    }
  }

  return orders.map((o) => {
    const lines: MyOrderHistoryEntry["lines"] = [];
    for (const sel of o.selections) {
      const sec = sectionById.get(sel.sectionId);
      const item = itemById.get(sel.menuItemId);
      if (sec && item) {
        lines.push({
          sectionTitle: sec.title,
          itemTitle: item.title,
          itemDescription: item.description,
        });
      }
    }
    lines.sort((a, b) => a.sectionTitle.localeCompare(b.sectionTitle, "es"));
    return {
      orderId: o.id,
      menuDayId: o.menuDayId,
      menuDate: o.menuDay.date,
      menuTitle: o.menuDay.title,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      lines,
    };
  });
}
