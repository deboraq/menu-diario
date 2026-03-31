import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/menu");
  }

  return <AdminShell>{children}</AdminShell>;
}
