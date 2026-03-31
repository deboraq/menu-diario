import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { createdAt: "desc" },
    select: { name: true, email: true, createdAt: true },
  });

  const rows: string[][] = [["Nombre", "Email", "Fecha de alta"]];
  for (const u of users) {
    rows.push([
      u.name,
      u.email,
      u.createdAt.toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    ]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Empleados");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const filename = `empleados-${dateKeyNow()}.xlsx`;

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}

function dateKeyNow(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
