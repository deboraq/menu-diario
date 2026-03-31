"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function listEmployeesForAdmin() {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
}
