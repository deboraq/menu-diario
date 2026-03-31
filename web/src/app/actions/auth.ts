"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type AuthFormState =
  | undefined
  | { error: string }
  | { ok: true; redirectTo: string };

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
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Revisá el correo y la contraseña." };
  }
  const { email, password } = parsed.data;
  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return {
      error:
        "No se pudo conectar a la base de datos. Revisá DATABASE_URL y DIRECT_URL en Vercel (sin comillas; pooler en DATABASE_URL).",
    };
  }
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Credenciales incorrectas." };
  }
  try {
    const session = await getSession();
    session.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
    };
    await session.save();
  } catch {
    return {
      error:
        "Error de sesión: SESSION_SECRET en Vercel debe tener al menos 32 caracteres y coincidir entre deploys.",
    };
  }
  // No usar redirect() acá: con useActionState en producción suele mostrar error genérico.
  return {
    ok: true,
    redirectTo: user.role === "ADMIN" ? "/admin" : "/menu",
  };
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
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
  let invite;
  try {
    invite = await prisma.invite.findUnique({ where: { token } });
  } catch {
    return {
      error:
        "No se pudo conectar a la base de datos. Revisá las variables en Vercel.",
    };
  }
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
  let user;
  try {
    user = await prisma.user.create({
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
  } catch {
    return { error: "No se pudo crear la cuenta. Probá de nuevo." };
  }
  try {
    const session = await getSession();
    session.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "EMPLOYEE",
    };
    await session.save();
  } catch {
    return {
      error:
        "Cuenta creada pero falló la sesión. Revisá SESSION_SECRET en Vercel (mín. 32 caracteres).",
    };
  }
  return { ok: true, redirectTo: "/menu" };
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
