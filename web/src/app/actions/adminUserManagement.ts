"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

const idSchema = z.string().min(1);

export async function listAllUsersForAdmin() {
  await requireAdminSession();
  return prisma.user.findMany({
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function adminSetUserPasswordAction(
  _prev: { error?: string; ok?: boolean; notice?: string } | undefined,
  formData: FormData
) {
  try {
    const session = await requireAdminSession();
    const userId = String(formData.get("userId") ?? "");
    const password = String(formData.get("password") ?? "");
    const parsedId = idSchema.safeParse(userId);
    const parsedPw = z.string().min(8).max(200).safeParse(password);
    if (!parsedId.success || !parsedPw.success) {
      return { error: "Contraseña mínimo 8 caracteres." };
    }
    const passwordHash = await bcrypt.hash(parsedPw.data, 10);
    await prisma.user.update({
      where: { id: parsedId.data },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.deleteMany({
      where: { userId: parsedId.data },
    });
    revalidatePath("/admin/usuarios");
    if (parsedId.data === session.user!.userId) {
      return {
        ok: true,
        notice: "Cambiaste tu propia contraseña. La próxima vez entrá con la nueva.",
      };
    }
    return { ok: true };
  } catch {
    return { error: "No autorizado." };
  }
}

const roleSchema = z.enum(["ADMIN", "EMPLOYEE"]);

export async function adminSetUserRoleAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  try {
    await requireAdminSession();
    const userId = String(formData.get("userId") ?? "");
    const roleRaw = String(formData.get("role") ?? "");
    const parsedId = idSchema.safeParse(userId);
    const parsedRole = roleSchema.safeParse(roleRaw);
    if (!parsedId.success || !parsedRole.success) {
      return { error: "Datos inválidos." };
    }

    const target = await prisma.user.findUnique({
      where: { id: parsedId.data },
      select: { role: true },
    });
    if (!target) {
      return { error: "Usuario no encontrado." };
    }

    if (parsedRole.data === "EMPLOYEE" && target.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return { error: "Tiene que haber al menos un administrador." };
      }
    }

    await prisma.user.update({
      where: { id: parsedId.data },
      data: { role: parsedRole.data },
    });
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch {
    return { error: "No autorizado." };
  }
}
