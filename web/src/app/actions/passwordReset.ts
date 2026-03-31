"use server";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

const RESET_HOURS = 24;

function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "")
  );
}

export async function requestPasswordResetAction(
  _prev:
    | { error?: string; ok?: boolean; message?: string; debugUrl?: string }
    | undefined,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { error: "Ingresá un correo válido." };
  }

  const generic =
    "Si hay una cuenta con ese correo, se puede usar un enlace de recuperación. Pedí a administración que te lo envíe; en desarrollo el enlace puede mostrarse abajo.";

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  if (!user) {
    return { ok: true as const, message: generic };
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const token = nanoid(40);
  const expiresAt = new Date(Date.now() + RESET_HOURS * 60 * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const base = appBaseUrl();
  const resetUrl = base ? `${base}/recuperar/${token}` : `/recuperar/${token}`;

  const out: { ok: true; message: string; debugUrl?: string } = {
    ok: true,
    message: generic,
  };

  if (process.env.NODE_ENV === "development" && base) {
    out.debugUrl = resetUrl;
  }

  return out;
}

export async function resetPasswordWithTokenAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  const raw = {
    token: formData.get("token"),
    password: formData.get("password"),
    password2: formData.get("password2"),
  };
  const schema = z.object({
    token: z.string().min(10),
    password: z.string().min(8).max(200),
    password2: z.string().min(8).max(200),
  });
  const parsed = schema.safeParse({
    token: String(raw.token ?? ""),
    password: String(raw.password ?? ""),
    password2: String(raw.password2 ?? ""),
  });
  if (!parsed.success) {
    return { error: "Contraseña mínimo 8 caracteres." };
  }
  if (parsed.data.password !== parsed.data.password2) {
    return { error: "Las contraseñas no coinciden." };
  }

  const row = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { error: "El enlace expiró o ya fue usado. Pedí uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: row.userId, id: { not: row.id } },
    }),
  ]);

  return { ok: true as const };
}

/** Admin: genera enlace para copiar y pasar al usuario (sin email automático). */
export async function adminCreatePasswordResetLinkAction(userId: string) {
  try {
    await requireAdminSession();
  } catch {
    return { error: "No autorizado." };
  }
  const parsed = z.string().min(1).safeParse(userId);
  if (!parsed.success) {
    return { error: "Usuario inválido." };
  }
  const user = await prisma.user.findUnique({ where: { id: parsed.data } });
  if (!user) {
    return { error: "Usuario no encontrado." };
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const token = nanoid(40);
  const expiresAt = new Date(Date.now() + RESET_HOURS * 60 * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const base = appBaseUrl();
  const path = `/recuperar/${token}`;
  const url = base ? `${base}${path}` : path;
  return { ok: true as const, url, expiresAt };
}
