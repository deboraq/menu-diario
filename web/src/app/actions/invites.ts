"use server";

import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session.user;
}

const createSchema = z.object({
  email: z.string().email(),
  daysValid: z.coerce.number().min(1).max(365).optional(),
});

export async function createInviteAction(
  _prev: { error?: string; url?: string } | undefined,
  formData: FormData
) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const parsed = createSchema.safeParse({
    email: formData.get("email"),
    daysValid: formData.get("daysValid") || 14,
  });
  if (!parsed.success) {
    return { error: "Correo inválido." };
  }
  const { email, daysValid = 14 } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Ese correo ya tiene cuenta." };
  }
  const token = nanoid(40);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);
  await prisma.invite.create({
    data: { email, token, expiresAt },
  });
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  const path = `/registro?token=${encodeURIComponent(token)}`;
  const url = base ? `${base}${path}` : path;
  return { url };
}

export async function listInvites() {
  await requireAdmin();
  return prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
