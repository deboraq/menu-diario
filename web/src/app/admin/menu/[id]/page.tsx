import { notFound } from "next/navigation";
import { MenuEditor } from "@/components/MenuEditor";
import { getMenuDayForAdminEdit } from "@/app/actions/menuAdmin";

type Props = { params: Promise<{ id: string }> };

export default async function AdminMenuEditPage({ params }: Props) {
  const { id } = await params;
  const data = await getMenuDayForAdminEdit(id);
  if (!data) {
    notFound();
  }

  const menu = JSON.parse(JSON.stringify(data.menu));

  return (
    <div>
      <MenuEditor menu={menu} orderCount={data.orderCount} />
    </div>
  );
}
