import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAggregatedOrdersForDay } from "@/app/actions/orders";
import { getSession } from "@/lib/session";
import { dateKeyFromDbDate } from "@/lib/dateKey";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const menuDayId = new URL(request.url).searchParams.get("menuDayId");
  if (!menuDayId?.trim()) {
    return NextResponse.json({ error: "Falta menuDayId" }, { status: 400 });
  }

  let data: Awaited<ReturnType<typeof getAggregatedOrdersForDay>>;
  try {
    data = await getAggregatedOrdersForDay(menuDayId);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!data) {
    return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
  }

  const wb = XLSX.utils.book_new();

  const totalRows: (string | number)[][] = [
    ["Sección", "Plato", "Cantidad", "Descripción", "Etiqueta"],
  ];
  for (const section of data.menuDay.sections) {
    for (const item of section.items) {
      const c = data.counts[item.id]?.count ?? 0;
      if (c > 0) {
        totalRows.push([
          section.title,
          item.title,
          c,
          item.description,
          item.tag ?? "",
        ]);
      }
    }
  }
  const ws1 = XLSX.utils.aoa_to_sheet(totalRows);
  XLSX.utils.book_append_sheet(wb, ws1, "Totales");

  const sectionTitles = data.menuDay.sections.map((s) => s.title);
  const personRows: string[][] = [["Nombre", "Email", ...sectionTitles]];
  for (const o of data.orders) {
    const row: string[] = [o.user.name, o.user.email];
    for (const s of data.menuDay.sections) {
      const sel = o.selections.find((x) => x.sectionId === s.id);
      const item = s.items.find((i) => i.id === sel?.menuItemId);
      row.push(item ? item.title : "—");
    }
    personRows.push(row);
  }
  const ws2 = XLSX.utils.aoa_to_sheet(personRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Por persona");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const safeTitle = (data.menuDay.title ?? "menu")
    .replace(/[^\w\s\-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 40);
  const filename = `pedidos-${safeTitle}-${dateKeyFromDbDate(data.menuDay.date)}.xlsx`;

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
