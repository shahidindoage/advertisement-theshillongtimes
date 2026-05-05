import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ShoppingBag } from "lucide-react";
import BookingTable from "../BookingTable";

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session");
  
  if (!isAdmin) {
    redirect("/admin/login");
  }

  const ads = await prisma.ad.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#249cff] rounded-xl flex items-center justify-center text-white shadow-lg">
          <ShoppingBag size={24} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">All Orders</h1>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <BookingTable ads={ads} />
      </div>
    </div>
  );
}
