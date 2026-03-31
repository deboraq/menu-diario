"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  token: z.string().min(8),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  password: z.string().min(8).max(200),
});

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Revisá el correo y la contraseña." };
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Credenciales incorrectas." };
  }
  const session = await getSession();
  session.user = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
  };
  await session.save();
  redirect(user.role === "ADMIN" ? "/admin" : "/menu");
}

export async function registerAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  const parsed = registerSchema.safeParse({
    token: formData.get("token"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Completá nombre, apellido y contraseña (mín. 8 caracteres)." };
  }
  const { token, firstName, lastName, password } = parsed.data;
  const name = `${firstName.trim()} ${lastName.trim()}`.trim();
  if (name.length < 3) {
    return { error: "Nombre y apellido demasiado cortos." };
  }
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) {
    return { error: "Invitación no encontrada." };
  }
  if (invite.usedAt) {
    return { error: "Esta invitación ya fue usada." };
  }
  if (invite.expiresAt < new Date()) {
    return { error: "La invitación expiró. Pedí una nueva a administración." };
  }
  const existing = await prisma.user.findUnique({
    where: { email: invite.email },
  });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: invite.email,
      name,
      passwordHash,
      role: "EMPLOYEE",
    },
  });
  await prisma.invite.update({
    where: { id: invite.id },
    data: { usedAt: new Date() },
  });
  const session = await getSession();
  session.user = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: "EMPLOYEE",
  };
  await session.save();
  redirect("/menu");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
