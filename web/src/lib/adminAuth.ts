import { getSession } from "@/lib/session";

export async function requireAdminSession() {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}
