"use server";

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

export type AdminDashboardSummary = {
  menuToday: {
    id: string;
    title: string | null;
    date: Date;
    visibleFromAt: Date;
    deadlineAt: Date;
    orderCount: number;
    deadlinePassed: boolean;
    ordersNotOpenYet: boolean;
  } | null;
  employeesRegistered: number;
  pendingInvites: number;
  recentOrders: { name: string; email: string }[];
};

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary | null> {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    return null;
  }

  const { start, end } = dayRange(new Date());

  const [menuToday, employeesRegistered, pendingInvites] = await Promise.all([
    prisma.menuDay.findFirst({
      where: { date: { gte: start, lt: end } },
      select: {
        id: true,
        title: true,
        date: true,
        visibleFromAt: true,
        deadlineAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.invite.count({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
    }),
  ]);

  const now = new Date();
  let recentOrders: { name: string; email: string }[] = [];

  if (menuToday) {
    const orders = await prisma.order.findMany({
      where: { menuDayId: menuToday.id },
      take: 12,
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });
    recentOrders = orders.map((o) => ({
      name: o.user.name,
      email: o.user.email,
    }));
  }

  return {
    menuToday: menuToday
      ? {
          id: menuToday.id,
          title: menuToday.title,
          date: menuToday.date,
          visibleFromAt: effectiveVisibleFrom({
            date: menuToday.date,
            visibleFromAt: menuToday.visibleFromAt,
          }),
          deadlineAt: menuToday.deadlineAt,
          orderCount: menuToday._count.orders,
          deadlinePassed: now > menuToday.deadlineAt,
          ordersNotOpenYet:
            now <
            effectiveVisibleFrom({
              date: menuToday.date,
              visibleFromAt: menuToday.visibleFromAt,
            }),
        }
      : null,
    employeesRegistered,
    pendingInvites,
    recentOrders,
  };
}
