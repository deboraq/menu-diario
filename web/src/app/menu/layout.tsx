import { redirect } from "next/navigation";
import { EmployeeShell } from "@/components/EmployeeShell";
import { getSession } from "@/lib/session";

export default async function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.user) {
    redirect("/login");
  }
  if (session.user.role === "ADMIN") {
    return <>{children}</>;
  }

  return <EmployeeShell userName={session.user.name}>{children}</EmployeeShell>;
}
